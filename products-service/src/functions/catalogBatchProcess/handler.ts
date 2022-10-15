import { AppError } from "@libs/app-error";
import { middyfy } from "@libs/lambda";
import { dynamo } from "@libs/dynamo";
import { v4 as uuid } from "uuid";
import { SQSEvent } from "aws-lambda";
import * as aws from "aws-sdk";

const catalogBatchProcess = async (
  event: SQSEvent
) => {
  try {

    const productsBatch = []
    const stocksBatch = []
    
    event.Records.forEach((event) => {
      const code = uuid().slice(0, 8);
      const { count, price, title , description} = JSON.parse(event.body)
      productsBatch.push({ id: code, price: Number(price), description, title })
      stocksBatch.push({
        id: code,
        count: Number(count)
      })
    })

    const productsTable = process.env.productsTable;
    const stocksTable = process.env.stocksTable;

    const batchData = {
      [productsTable]: productsBatch,
      [stocksTable]: stocksBatch
    }

    await dynamo.batchWrite(batchData)

    const sns = new aws.SNS({ region: 'eu-west-1' })

    await sns.publish({
      Subject: 'New product has been added',
      Message: JSON.stringify(batchData),
      TopicArn: process.env.snsArn
    }).promise()


  } catch (error) {
    throw new AppError(error.message, 500);
  }
};

export const main = middyfy(catalogBatchProcess);

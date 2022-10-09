import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { AppError } from "@libs/app-error";
import { middyfy } from "@libs/lambda";
import { dynamo } from "@libs/dynamo";
import { v4 as uuid } from "uuid";
import schema from "./schema";

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    const body = JSON.parse(JSON.stringify(event.body));
    const code = uuid().slice(0, 8);

    const productItem = {
      description: body.description,
      price: body.price,
      id: code,
      title: body.title,
    };

    const stockItem = {
      id: code,
      count: body.count,
    };

    const productsTable = process.env.productsTable;
    const stocksTable = process.env.stocksTable;

    await Promise.all([
      dynamo.write(productItem, productsTable),
      dynamo.write(stockItem, stocksTable),
    ]);
    console.log({
      data: { ...body, id: code },
      event,
    });

    return formatJSONResponse({
      data: { ...body, id: code },
      event,
    });
  } catch (error) {
    throw new AppError(error.message, 500);
  }
};

export const main = middyfy(createProduct);

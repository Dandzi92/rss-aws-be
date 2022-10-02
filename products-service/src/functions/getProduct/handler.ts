import { formatJSONResponse } from "@libs/api-gateway";
import { AppError } from "@libs/app-error";
import { middyfy } from "@libs/lambda";
import { dynamo } from "@libs/dynamo";
import { APIGatewayProxyEvent } from "aws-lambda";

const getProduct = async (event: APIGatewayProxyEvent) => {
  try {
    const id = event.pathParameters.id;
    const productsTable = process.env.productsTable;
    const stocksTable = process.env.stocksTable;
    const [productResult, stocksResult] = await Promise.all([
      dynamo.get(id, productsTable),
      dynamo.get(id, stocksTable),
    ]);

    if (!productResult) throw new AppError("Product not found", 404);

    const product = { ...productResult, count: stocksResult.count };

    console.log({
      data: product,
      event,
    });

    return formatJSONResponse({
      data: product,
      event,
    });
  } catch (error) {
    throw new AppError(error.message, 500);
  }
};

export const main = middyfy(getProduct);

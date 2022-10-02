import { formatJSONResponse } from "@libs/api-gateway";
import { AppError } from "@libs/app-error";
import { dynamo } from "@libs/dynamo";
import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent } from "aws-lambda";

const getProducts = async (event: APIGatewayProxyEvent) => {
  try {
    const productsTable = process.env.productsTable;
    const stocksTable = process.env.stocksTable;
    const [productsResults, stocksResults] = await Promise.all([
      dynamo.getAll(productsTable),
      dynamo.getAll(stocksTable),
    ]);
    const products = productsResults.map((product) => {
      const stocksResult = stocksResults.find(
        (stock) => stock.id === product.id
      );
      return { ...product, count: stocksResult.count };
    });
    console.log({
      data: products,
      event,
    });

    return formatJSONResponse({
      data: products,
      event,
    });
  } catch (error) {
    throw new AppError(error.message, 500);
  }
};

export const main = middyfy(getProducts);

import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { s3Client } from "@libs/s3";
import { APIGatewayProxyEvent } from "aws-lambda";

const importProductsFile = async (event: APIGatewayProxyEvent) => {
  const bucket = process.env.importFileBucket;
  const key = `uploaded/${event.queryStringParameters.name}`;

  const getObjectParams = { Bucket: bucket, Key: key, Expires: 300 };

  const url = await s3Client.getSignedUrl("putObject", getObjectParams);

  return formatJSONResponse(url);
};

export const main = middyfy(importProductsFile);

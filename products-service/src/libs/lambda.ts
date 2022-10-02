import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import type { AWS } from "@serverless/typescript";
import { apiGatewayResponseMiddleware } from "./middleware";

export const middyfy = (handler) => {
  return middy(handler)
    .use(apiGatewayResponseMiddleware({ enableErrorLogger: false }))
    .use(middyJsonBodyParser());
};

export type AWSFunction = AWS["functions"][0];

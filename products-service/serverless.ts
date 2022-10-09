import type { AWS } from "@serverless/typescript";

import getProducts from "@functions/getProducts";
import getProduct from "@functions/getProduct";
import createProduct from "@functions/createProduct";

const serverlessConfiguration: AWS = {
  resources: {
    Resources: {
      productsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:custom.productsTableName}",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
        },
      },
      stocksTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:custom.stocksTableName}",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
        },
      },
    },
  },
  service: "products-service",
  frameworkVersion: "3",
  plugins: [
    "serverless-auto-swagger",
    "serverless-esbuild",
    "serverless-offline",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-west-1",
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "dynamodb:*",
        Resource:
          "arn:aws:dynamodb:${self:provider.region}:${aws:accountId}:table/${self:custom.productsTableName}",
      },
      {
        Effect: "Allow",
        Action: "dynamodb:*",
        Resource:
          "arn:aws:dynamodb:${self:provider.region}:${aws:accountId}:table/${self:custom.stocksTableName}",
      },
    ],
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      stocksTable: "${self:custom.stocksTableName}",
      productsTable: "${self:custom.productsTableName}",
    },
  },
  // import the function via paths
  functions: { getProducts, getProduct, createProduct },
  package: { individually: true },
  custom: {
    stocksTableName: "${sls:stage}-table-stocks",
    productsTableName: "${sls:stage}-table-products",
    autoswagger: {
      useStage: true,
      basePath: "/dev",
      host: "xwd18eaflg.execute-api.eu-west-1.amazonaws.com",
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;

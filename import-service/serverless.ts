import { importFileParser, importProductsFile } from "@functions/index";
import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: "parse-csv-products-sqs-queue"
        }
      }
    }
  },
  service: "import-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-west-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      importFileBucket: "${self:custom.server.s3ProductsBucketName}",
      SQSUrl: {
        Ref: 'SQSQueue'
      }
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "s3:ListBucket",
        Resource: "arn:aws:s3:::my-products-file-bucket/*",
      },
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource: "arn:aws:s3:::my-products-file-bucket/*",
      },
      {
        Effect: "Allow",
        Action: "sqs:*",
        Resource: [{'Fn::GetAtt': ['SQSQueue', 'Arn']}]
      }
    ],
  },
  // import the function via paths
  functions: { importFileParser, importProductsFile },
  package: { individually: true },
  custom: {
    server: {
      s3ProductsBucketName: "my-products-file-bucket",
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

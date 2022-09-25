import type { AWS } from "@serverless/typescript";

// import hello from "@functions/hello";
import getProducts from "@functions/getProducts";
import getProduct from "@functions/getProduct";

const serverlessConfiguration: AWS = {
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
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
  },
  // import the function via paths
  functions: { getProducts, getProduct },
  package: { individually: true },
  custom: {
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

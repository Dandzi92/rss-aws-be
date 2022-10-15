import { handlerPath } from "@libs/handler-resolver";
import { AWSFunction } from "@libs/lambda";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: "${self:custom.server.s3ProductsBucketName}",
        event: "s3:ObjectCreated:*",
        rules: [{ prefix: "uploaded/" }],
        existing: true,
      },
    },
  ],
} as AWSFunction;

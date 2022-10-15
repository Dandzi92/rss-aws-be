import { handlerPath } from "@libs/handler-resolver";
import { AWSFunction } from "@libs/lambda";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: {
        batchSize: 5,
        arn: "arn:aws:sqs:${self:provider.region}:${aws:accountId}:parse-csv-products-sqs-queue", 
      },
    },
  ],
} as AWSFunction;

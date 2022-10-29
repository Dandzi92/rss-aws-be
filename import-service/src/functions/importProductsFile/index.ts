import { handlerPath } from "@libs/handler-resolver";
import { AWSFunction } from "@libs/lambda";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "import",
        cors: true,
        authorizer: {
            name: 'basicAuthorizer',
            type: 'token',
            arn: 'arn:aws:lambda:${self:provider.region}:${aws:accountId}:function:authorization-service-dev-basicAuthorizer',
            resultTtlInSeconds: 0,
            identitySource: 'method.request.header.Authorization'
        }
      },
    },
  ],
} as AWSFunction;;

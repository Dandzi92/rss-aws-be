// import { middyfy } from '@libs/lambda';
import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';

const basicAuthorizer= async (event: APIGatewayTokenAuthorizerEvent, ctx, cb) => {
  console.log(event, 'EVENT');
  
  if (event['type'] != 'TOKEN')  cb('Unauthorized')
  try {
    const authorizationToken = event.authorizationToken;
    const encodedCreds = authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
    const [userName, password] = plainCreds;

    const storedUserPassword = process.env[userName]
    const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';
    
    const policy = generatePolicy(encodedCreds, event.methodArn, effect) 

    cb(null, policy)

  } catch (error) {
    cb(`Unauthorized: ${error.message}`)
  }
};

const generatePolicy = (principalId, resource, effect = 'Allow') => {
  return {
      principalId,
      policyDocument: {
          Version: '2012-10-17',
          Statement: {
              Action: 'execute-api:Invoke',
              Effect: effect,
              Resource: resource,
          },
      },
  };
};

export const main = basicAuthorizer;

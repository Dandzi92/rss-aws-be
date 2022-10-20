import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  PutCommandInput,
  GetCommand,
  GetCommandInput,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
  BatchWriteCommandInput,
  BatchWriteCommand
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});

export const dynamo = {
  write: async (data: Record<string, any>, tableName: string) => {
    const params: PutCommandInput = {
      TableName: tableName,
      Item: data,
    };
    const command = new PutCommand(params);

    await dynamoClient.send(command);

    return data;
  },

  batchWrite: async (tableData) => {
    const batchData = {
      RequestItems: {}
    }
    Object.keys(tableData).forEach(tableName => {
      batchData.RequestItems[tableName] = tableData[tableName].map(item => {
        return {
          PutRequest: {
            Item: {
              ...item
            }
          }
        }
      })
    })

    const command = new BatchWriteCommand(batchData);
    const response = await dynamoClient.send(command);

    return response
 },

  get: async (id: string, tableName: string) => {
    const params: GetCommandInput = {
      TableName: tableName,
      Key: {
        id,
      },
    };
    const command = new GetCommand(params);
    const response = await dynamoClient.send(command);

    return response.Item;
  },

  getAll: async (tableName: string) => {
    const params: ScanCommandInput = {
      TableName: tableName,
    };
    const command = new ScanCommand(params);
    const response = await dynamoClient.send(command);
    return response.Items;
  },

  query: async ({
    tableName,
    index,

    pkValue,
    pkKey = "pk",

    skValue,
    skKey = "sk",

    sortAscending = true,
  }: {
    tableName: string;
    index: string;

    pkValue: string;
    pkKey?: string;

    skValue?: string;
    skKey?: string;

    sortAscending?: boolean;
  }) => {
    const skExpression = skValue ? ` AND ${skKey} = :rangeValue` : "";

    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: index,
      KeyConditionExpression: `${pkKey} = :hashValue${skExpression}`,
      ExpressionAttributeValues: {
        ":hashValue": pkValue,
      },
    };

    if (skValue) {
      params.ExpressionAttributeValues[":rangeValue"] = skValue;
    }

    const command = new QueryCommand(params);
    const res = await dynamoClient.send(command);

    return res.Items;
  },
};

import { ListTablesCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const client = new DynamoDBClient({ region: "us-east-2" });
const docClient = DynamoDBDocumentClient.from(client);

export const fetchCards = async (name) => {
  let items = [];
  let ExclusiveStartKey;

  do {
    const command = new ScanCommand({
      TableName: "YGO_table",
      FilterExpression: "contains(#name, :nameValue)",
      ExpressionAttributeNames: { "#name": "Name" },
      ExpressionAttributeValues: { ":nameValue": name },
      ExclusiveStartKey: ExclusiveStartKey || undefined,
    });

    const response = await docClient.send(command);
    items = items.concat(response.Items);
    ExclusiveStartKey = response.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return items;
};

export const fetchCard = async (name) => {
  const queryCommand = new QueryCommand({
    Limit: 20,
    TableName: "YGO_table",
    IndexName: "Name-index", // Use the GSI name
    KeyConditionExpression: "#name = :nameValue",
    ExpressionAttributeNames: {
      "#name": "Name", // The attribute name for the card's name
    },
    ExpressionAttributeValues: {
      ":nameValue": name, // The name of the card to fetch
    },
  });
  const response = await docClient.send(queryCommand);

  return response;
};

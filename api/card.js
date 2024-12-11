import { ListTablesCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommand,
  PutCommand,
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const client = new DynamoDBClient({ region: "us-east-2" });
const docClient = DynamoDBDocumentClient.from(client);

export const fetchCards = async () => {
  const command = new ScanCommand({
    ExpressionAttributeNames: { "#cardId": "CardID", "#name": "Name" },
    ProjectionExpression: "#cardId, #name",
    TableName: "YGO_table",
  });

  const response = await docClient.send(command);

  return response;
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

// export const createCards = async ({ name, completed }) => {
//   const uuid = crypto.randomUUID();
//   const command = new PutCommand({
//     TableName: "YGO_table",
//     Item: {
//       id: uuid,
//       name,
//       completed,
//     },
//   });

//   const response = await docClient.send(command);

//   return response;
// };

// export const updateCards = async ({ id, name, completed }) => {
//   const command = new UpdateCommand({
//     TableName: "YGO_table",
//     Key: {
//       id,
//     },
//     ExpressionAttributeNames: {
//       "#name": "name",
//     },
//     UpdateExpression: "set #name = :n, completed = :c",
//     ExpressionAttributeValues: {
//       ":n": name,
//       ":c": completed,
//     },
//     ReturnValues: "ALL_NEW",
//   });

//   const response = await docClient.send(command);

//   return response;
// };

// export const deletecards = async (id) => {
//   const command = new DeleteCommand({
//     TableName: "YGO_table",
//     Key: {
//       id,
//     },
//   });

//   const response = await docClient.send(command);

//   return response;
// };

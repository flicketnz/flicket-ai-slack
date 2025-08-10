import { registerAs } from "@nestjs/config";

export default registerAs("aws", () => ({
  // common
  endpoint: process.env.AWS_ENDPOINT_URL,
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

  // service specific
  "dynamodb.tablePrefix": process.env.DYNAMODB_TABLE_PREFIX,
  "dynamodb.endpoint": process.env.AWS_ENDPOINT_URL_DYNAMODB
    ? process.env.AWS_ENDPOINT_URL_DYNAMODB
    : process.env.AWS_ENDPOINT_URL,
  "dynamodb.createTables": Boolean(process.env.DYNAMODB_CREATE_TABLES),
}));

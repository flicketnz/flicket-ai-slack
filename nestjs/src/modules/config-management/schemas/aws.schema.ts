/** biome-ignore-all lint/suspicious/noThenProperty: <explanation> */
import * as Joi from "joi";

import { NodeEnv } from "../types/config.types";

export const awsValidationSchema = Joi.object({
  // AWS Config (used by dynamodb and other aws clients)
  AWS_DEFAULT_REGION: Joi.string().required(),
  AWS_ENDPOINT_URL: Joi.string()
    .optional()
    .description(
      "Used to overite all aws client endpoints for an alternative. i.e. localstack",
    ),

  // DynamoDB Configuration
  AWS_ACCESS_KEY_ID: Joi.any().when("NODE_ENV", {
    is: NodeEnv.PRODUCTION,
    then: Joi.string().optional(),
    otherwise: Joi.string().required(),
  }),
  AWS_SECRET_ACCESS_KEY: Joi.any().when("NODE_ENV", {
    is: NodeEnv.PRODUCTION,
    then: Joi.string().optional(),
    otherwise: Joi.string().required(),
  }),
  AWS_ENDPOINT_URL_DYNAMODB: Joi.string()
    .optional()
    .description(
      "Used to overwrite the endpoint used by dynamodb clients specifically",
    ),
  DYNAMODB_TABLE_PREFIX: Joi.string().default("flicket"),
  DYNAMODB_CREATE_TABLES: Joi.boolean().optional().default(false),
});

/** biome-ignore-all lint/suspicious/noThenProperty: <explanation> */
import * as Joi from "joi";

import { NodeEnv } from "../types/config.types";

export const commonValidationSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .default(NodeEnv.DEVELOPMENT),
  PORT: Joi.number().default(6655),
});

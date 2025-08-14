import * as Joi from "joi";

import { LLM_Provider } from "../types/config.types";

export const llmValidationSchema = Joi.object({
  LLM_PRIMARY_PROVIDER: Joi.string()
    .valid(...Object.values(LLM_Provider))
    .required(),
});

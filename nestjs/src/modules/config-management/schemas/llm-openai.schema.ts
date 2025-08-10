/** biome-ignore-all lint/suspicious/noThenProperty: <explanation> */
import * as Joi from "joi";

export const llmOpenAiValidationSchema = Joi.object({
  LLM_OPENAI_MODEL: Joi.any().when("LLM_PRIMARY_PROVIDER", {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  LLM_OPENAI_TEMP: Joi.number().min(0.0).max(1.0).default(0.1),
  LLM_OPENAI_KEY: Joi.any().when("LLM_PRIMARY_PROVIDER", {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  LLM_OPENAI_BASE_URL: Joi.string().optional(),
});

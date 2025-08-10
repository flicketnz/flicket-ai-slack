/** biome-ignore-all lint/suspicious/noThenProperty: <explanation> */
import * as Joi from "joi";

export const llmToolsSearxngValidationSchema = Joi.object({
  LLM_TOOLS_SEARXNG_ENABLED: Joi.boolean().default(false),
  LLM_TOOLS_SEARXNG_API_BASE: Joi.any().when("LLM_TOOLS_SEARXNG_ENABLED", {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
});

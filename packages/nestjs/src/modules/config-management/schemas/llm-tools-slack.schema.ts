import * as Joi from "joi";

export const llmToolsSlackValidationSchema = Joi.object({
  LLM_TOOLS_SLACK_ENABLED: Joi.boolean().default(false),
});

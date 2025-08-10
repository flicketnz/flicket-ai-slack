import { registerAs } from "@nestjs/config";

export default registerAs("llm.tools.slack", () => {
  return {
    enabled: process.env.LLM_TOOLS_SLACK_ENABLED,
  };
});

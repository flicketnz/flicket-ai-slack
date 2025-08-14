import { registerAs } from "@nestjs/config";

export default registerAs("llm", () => {
  return {
    llmPrimaryProvider: process.env.LLM_PRIMARY_PROVIDER,
  };
});

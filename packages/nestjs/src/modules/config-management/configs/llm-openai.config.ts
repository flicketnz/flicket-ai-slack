import { registerAs } from "@nestjs/config";

export default registerAs("llm.openai", () => {
  return {
    model: process.env.LLM_OPENAI_MODEL,
    temp: Number.parseFloat(process.env.LLM_OPENAI_TEMP!),
    apiKey: process.env.LLM_OPENAI_KEY,
    baseUrl: process.env.LLM_OPENAI_BASE_URL,
  };
});

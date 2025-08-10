import { registerAs } from "@nestjs/config";

export default registerAs("llm.tools.searxng", () => {
  return {
    enabled: process.env.LLM_TOOLS_SEARXNG_ENABLED,
    apiBase: process.env.LLM_TOOLS_SEARXNG_API_BASE,
  };
});

import { Tool } from "langchain/tools";
import EnvironmentService from "../services/environment-service.js";

function getToolOptionDescription(): string {
  let description = "\n<Optional>:";
  description += `\n[${EnvironmentService.names.OPENAI_API_KEY}]: Enables the use of OpenAI to enable LLM functionality.`;
  return description;
}

function getEnabledTools(): { [name: string]: Tool } {
  const tools: { [name: string]: Tool } = {
    // Default tools
    // TODO: Add the default tools
  };

  // Environment Tools
  // TODO: Add enviornment tools

  // search tools
  // TODO: Add search tools

  return tools;
}

export { getToolOptionDescription, getEnabledTools };
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { END, START, StateGraph, StateGraphArgs } from "@langchain/langgraph";

// Get the current file URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the parent directory
dotenv.config({ path: resolve(__dirname, '../../.env') });

// LLM key
const llmKey = process.env.TS_LLM_KEY;

/**
  * Represents the state of our graph.
  * The graph state contains the original prommpt.
  * The graph state contains the documents that are generated from the prompt.
  * The graph state also contains the question that is generated from the prompt.
  * The graph state also contains the generation that is generated from the prompt.
*/
type GraphState = {
  prompt: string;
  documents?: Document[];
  generation?: string;
  question?: string;
};

/** 
 * Initializes the graph state channels.
*/
const graphState: StateGraphArgs<GraphState>["channels"] = {
  prompt: {
    value: (left?: string, right?: string) => (right ? right : left || ""),
    default: () => "",
  },
  documents: {
    value: (left?: Document[], right?: Document[]) =>
      right ? right : left || [],
    default: () => [],
  },
  question: {
    value: (left?: string, right?: string) => (right ? right : left || ""),
    default: () => "",
  },
  generation: {
    value: (left?: string, right?: string) => (right ? right : left),
    default: () => undefined,
  },
};

/**
 * Configures the model using LangChain API
 * Supported Models:
 * GPT-4
 * Claude
*/
function configureModel(){

}

/**
 * Check the token size of the prompt using a tokenizer
 * Checks the models that is currently being used
 * Based off the token limit on the model calculates if the prompt is to big
 * Returns true or false depending on if the prompt is to large
  * @param prompt
*/
function checkTokenSize(prompt: string){
  
}

/**
 * Summarizes the prompt using a summarizer
 * Ensures the prompt is under the token limit
 * Tries to ensure all relevant details are included in the summarized prompt
 * @param prompt
*/
function summarizePrompt(prompt: string){

}

/**
 * Checks for missing details in the prompt
 * If there are missing details the function returns true or false based on if the details are significant enough
 * @param prompt 
 */
function checkMissingDetails(prompt: string){

}

/**
 * Runs the models using the new summarized prompt or original prompt if no summarizer is used
 */
function generate(){

}

export function processTokens(inputText: string): string {
  // Infinite token processing logic here

  // Implement Build Graph
  const workflow = new StateGraph<GraphState>({
      channels: graphState,
    })

  return `Processed: ${inputText} with key ${llmKey}`;
}
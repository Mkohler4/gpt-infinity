import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document, type DocumentInterface } from "@langchain/core/documents";
import { END, START, StateGraph, StateGraphArgs } from "@langchain/langgraph";
import { pull } from "langchain/hub";
import { encoding_for_model, Tiktoken, TiktokenModel } from 'tiktoken';
import { z } from "zod";
import { StructuredTool } from 'langchain/tools';


// Get the current file URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the parent directory
dotenv.config({ path: resolve(__dirname, '../../.env') });

/**
  * Represents the state of our graph.
  * The graph state contains the original prompt.
  * The graph state contains the documents that are generated from the prompt.
  * The graph state also contains the question that is used for document retrieval.
  * The graph state also contains the generation that is generated from the prompt.
*/
type GraphState = {
  prompt: string;
  question: string;
  documents?: Document[];
  generation?: string;
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

// Define an interface for the model-specific configuration
interface ModelConfig {
  maxTokens: number;
}

// Mapping of model names to their configurations
const modelConfigs: { [modelName: string]: ModelConfig } = {
  'gpt-3.5-turbo': { maxTokens: 4096 },
  'gpt-4': { maxTokens: 8192 },
  'summarization': { maxTokens: 100000 },
};

/**
 * Configures the model using LangChain API
 * Supported Models:
 * GPT-4
 * Claude
 */
// function configureModel() {
//   // Placeholder for model configuration logic
//   return {
//     tokenizer: new Tokenizer(llmKey),
//     summarizer: new Summarizer(llmKey),
//     generator: new Generator(llmKey),
//   };
// }

/**
 * Checks the token size of a prompt based on a model
 * @param prompt 
 * @param modelName 
 */
function countTokens(prompt: string, modelName: TiktokenModel): number {
  const encoding: Tiktoken = encoding_for_model(modelName);
  const tokens = encoding.encode(prompt);
  return tokens.length;
}

/**
 * Check the token size of the prompt using a tokenizer
 * Checks the models that is currently being used
 * Based off the token limit on the model calculates if the prompt is too big
 * Returns true or false depending on if the prompt is too large
 * @param prompt
 */
function doesExceedTokens(prompt: string, modelName: TiktokenModel): boolean {
  const tokenCount = countTokens(prompt, modelName);
  return tokenCount > modelConfigs[modelName].maxTokens;;
}

/**
 * Checks for missing details in the prompt
 * If there are missing details the function returns true or false based on if the details are significant enough
 * @param prompt 
 */
// function checkMissingDetails(prompt: string): boolean {
//   // Placeholder for logic to check for missing details
//   return false;
// }

/**
 * Transform the query to produce a better question.
 *
 * @param {GraphState} state The current state of the graph.
 * @param {RunnableConfig | undefined} config The configuration object for tracing.
 * @returns {Promise<GraphState>} The new state object.
 */
async function transformQuery(state: GraphState) {
  console.log("---TRANSFORM QUERY---");
  // Pull in the prompt
  const prompt = ChatPromptTemplate.fromTemplate(
    `You are generating a question that is well optimized for semantic search retrieval.
  Look at the input and try to reason about the underlying sematic intent / meaning.
  Here is the initial question:
  \n ------- \n
  {question} 
  \n ------- \n
  Formulate an improved question: `,
  );

  // Grader
  const model = new ChatOpenAI({
    modelName: "gpt-4-0125-preview",
    temperature: 0,
    streaming: true,
  });

  // Prompt
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const betterQuestion = await chain.invoke({ question: state.question });

  return {
    question: betterQuestion,
  };
}

/**
 * Retrieve documents
 *
 * @param {GraphState} state The current state of the graph.
 * @param {RunnableConfig | undefined} config The configuration object for tracing.
 * @returns {Promise<GraphState>} The new state object.
 */
async function retrieve(state: GraphState) {
  console.log("---RETRIEVE---");
  console.log(state);
  // const documents = await retriever
  //   .withConfig({ runName: "FetchRelevantDocuments" })
  //   .invoke(state.question);
  // return {
  //   documents,
  // };
}

async function didHullcinate(state: GraphState) {

}

/**
 * Runs the models using the new summarized prompt or original prompt if no summarizer is used
 * @param {GraphState} state The current state of the graph.
 * @param {RunnableConfig | undefined} config The configuration object for tracing.
 * @returns {Promise<GraphState>} The new state object.
 */
async function generate(state: GraphState): Promise<GraphState> {
  console.log("---GENERATE---");
  // Pull in the prompt
  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  // LLM
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
  });

  // RAG Chain
  const ragChain = prompt.pipe(llm).pipe(new StringOutputParser());

  var docs: string = "";

  // if(state.documents) {
  //   docs = state.documents
  //   .map((doc) => doc.pageContent)
  //   .join("\n\n");
  // }
  
  const generation = await ragChain.invoke({
    // context: docs,
    question: state.question ?? state.prompt,
  });

  console.log("Prompt");
  console.log(state.prompt);
  console.log("Question");
  console.log(state.question);
  console.log("Documents");
  console.log(state.documents);
  console.log("Generation");
  console.log(generation);

  return {
    prompt: state.prompt,
    question: state.question,
    documents: state.documents,
    generation: generation
  };
}

export async function processGraph(inputText: string): Promise<string> {

  const workflow = new StateGraph<GraphState>({
    channels: graphState,
  })

  .addNode("generate", generate);

  const app = workflow.compile();
  
  const config = { recursionLimit: 50 };
  const inputs = {
    keys: { question: "Explain how the different types of agent memory work." },
  }
  let finalGeneration;
  for await (const output of await app.stream(inputs, config)) {
    for (const [key, value] of Object.entries(output)) {
      console.log(`Node: '${key}'`);
      // Optional: log full state at each node
      // console.log(JSON.stringify(value, null, 2));
      finalGeneration = value;
    }
    console.log("\n---\n");
  }

  console.log("Final Generation");

  // Log the final generation.
  console.log(JSON.stringify(finalGeneration, null, 2));

  return JSON.stringify(finalGeneration);
}
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the current file URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the parent directory
dotenv.config({ path: resolve(__dirname, '../../.env') });

const llmKey = process.env.TS_LLM_KEY;

export function processTokens(inputText: string): string {
    // Infinite token processing logic here
    return `Processed: ${inputText} with key ${llmKey}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    console.log(processTokens("Test input"));
}
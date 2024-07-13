// ts/src/cli.ts
import { processTokens } from './index.js';

const input = process.argv[2];

if (!input) {
    console.error('Please provide input text to process');
    process.exit(1);
}

const result = processTokens(input);
console.log(result);
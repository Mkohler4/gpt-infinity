// ts/src/cli.ts
import { processGraph } from './index.js';

const input = process.argv[2];

if (!input) {
    console.error('Please provide input text to process');
    process.exit(1);
}

const result = processGraph(input);
console.log(result);
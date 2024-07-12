import { ProgramInput, ProgramInterface } from "./program-interface.js";
import EnvironmentService from "../services/environment-service.js";
import * as toolHelper from "../helpers/agent-tool-helper.js";

class InfiniteTokenParser extends ProgramInterface {
    protected get name(): string {
        return "infiparser";
    }
    protected get aliases(): string[] {
        return ["c"];
    }
    protected get description(): string {
        return "A infinite token parser for both inputs and outputs that utlizes GPT, Claude and More";
    }
    protected get requiredEnvironmentVariables(): string[] {
        return [EnvironmentService.names.OPENAI_API_KEY];
    }

    protected formatDescription(): string {
        let description = super.formatDescription() + toolHelper.getToolOptionDescription();

        return description;
    }

    public async run(input: ProgramInput): Promise<void> {
        // Create model
        // TODO: Set up LLM models

    }
}

export default InfiniteTokenParser;
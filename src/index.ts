import { Command } from "commander";
import figlet from "figlet";
import InfiniteTokenParser from "./programs/infinity-token-parser.js";
import ConfigureProgram from "./programs/configure/configure-program.js";

const version = "0.0.1";
const description = "A infinite token parser for both inputs and outputs that utlizes GPT, Claude and More";

async function main(): Promise<void> {
    console.log(figlet.textSync("Infinity GPT"));

    // Create a new command instance for the program and configure it with root commands
    const cliApp = new Command()
        .version(version)
        .description(description)
        .option("-d, --debug", "toggles verbose logging", false);

    // Configure the help command
    cliApp.configureHelp({
        sortSubcommands: true,
        sortOptions: true,
        showGlobalOptions: true,
        subcommandDescription(cmd) {
            return cmd.description();
        },
        subcommandTerm: (cmd: Command): string => {
            let term = cmd.name();
            if(cmd.alias()) {
                term += `,  ${cmd.aliases().join(", ")}`;
            }
            return term;
        }
    });

    // Configure the programs
    new ConfigureProgram().configure(cliApp);
    new InfiniteTokenParser().configure(cliApp);


    // parse the args for the program
    await cliApp.parseAsync(process.argv);
}

main();
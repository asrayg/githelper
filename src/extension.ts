// import * as vscode from 'vscode';
// import axios from 'axios';
// // import * as dotenv from 'dotenv';
// import { exec } from 'child_process';
// import * as path from 'path';
// import * as fs from 'fs';

// // dotenv.config();

// export function activate(context: vscode.ExtensionContext) {
//     console.log('Congratulations, your extension "git-helper" is now active!');

//     let terminal = vscode.window.activeTerminal;
//     if (!terminal) {
//         terminal = vscode.window.createTerminal('Git Helper Terminal');
//         terminal.show();
//     }

//     let disposable = vscode.commands.registerCommand('extension.helpWithGit', async () => {
//         console.log('Command "Help with Git" executed');

//         const apiKey = 'sk-proj-dpefHjcDYwF9wCnM8b7iT3BlbkFJ3YHqS0zNat0PpiK8wejt'; 
//         if (!apiKey) {
//             vscode.window.showErrorMessage('OpenAI API key is missing');
//             return;
//         }

//         try {
//             const gitInfo = await getGitInfo();
//             vscode.window.showInformationMessage(`Git Info: ${JSON.stringify(gitInfo, null, 2)}`);

//             const response = await vscode.window.showInputBox({ prompt: 'Ask your Git-related question or type "check terminal"' });
//             if (response) {
//                 console.log(`User question: ${response}`);

//                 if (response.toLowerCase() === 'check terminal') {
//                     const lastCommandInfo = await getLastCommandInfo();
//                     if (lastCommandInfo) {
//                         vscode.window.showInformationMessage(`Last Command: ${lastCommandInfo.command}\nOutput: ${lastCommandInfo.output}`);
//                         await analyzeTerminalOutput(lastCommandInfo, apiKey);
//                     } else {
//                         vscode.window.showErrorMessage('No previous command found.');
//                     }
//                 } else {
//                     await getHelpFromOpenAI(response, apiKey, gitInfo);
//                 }
//             }
//         } catch (error) {
//             vscode.window.showErrorMessage(`Failed to retrieve Git info`);
//         }
//     });

//     context.subscriptions.push(disposable);

//     // Register a custom command to send text to the terminal and log it
//     let sendCommandDisposable = vscode.commands.registerCommand('extension.sendTerminalCommand', async (command: string) => {
//         if (!terminal) {
//             terminal = vscode.window.createTerminal('Git Helper Terminal');
//             terminal.show();
//         }
//         logCommandOutput(command, '');
//         terminal.sendText(command);
//         await captureTerminalOutput(command);
//     });

//     context.subscriptions.push(sendCommandDisposable);
// }

// async function getGitInfo(): Promise<any> {
//     const gitCommands = {
//         head: 'git rev-parse --abbrev-ref HEAD',
//         branches: 'git branch -a',
//         remotes: 'git remote -v',
//         status: 'git status --short'
//     };

//     let gitInfo: { [key: string]: string } = {};

//     for (const [key, command] of Object.entries(gitCommands)) {
//         try {
//             gitInfo[key] = await executeCommand(command);
//         } catch (error) {
//             gitInfo[key] = `Error`;
//         }
//     }

//     return gitInfo;
// }

// function executeCommand(command: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`Error executing command ${command}:`, stderr);
//                 reject(new Error(stderr));
//             } else {
//                 resolve(stdout.trim());
//             }
//         });
//     });
// }

// async function getHelpFromOpenAI(query: string, apiKey: string, gitInfo: any) {
//     const endpoint = 'https://api.openai.com/v1/chat/completions';
//     console.log(`Using endpoint: ${endpoint}`);
//     console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

//     try {
//         const openaiResponse = await axios.post(endpoint, {
//             model: "gpt-3.5-turbo",
//             messages: [
//                 { role: "system", content: "You are an efficient and helpful assistant for Git commands. Keep your responses short, concise, and in plain text. Avoid formatting the code in bash or any other language. For example, if a user asks how to clone a repository, respond with: git clone <repository_url>. Replace <repository_url> with the actual URL of the repository. Focus on providing clear and straightforward instructions for each Git command. Here is the user's Git info: " + JSON.stringify(gitInfo) },
//                 { role: "user", content: query }
//             ],
//             max_tokens: 150,
//             temperature: 0.5,
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${apiKey}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         const message = openaiResponse.data.choices[0].message.content.trim();
//         console.log(`OpenAI response: ${message}`);
//         vscode.window.showInformationMessage(`OpenAI Response: ${message}`);
//     } catch (error) {
//         console.error('Error', error);
//         vscode.window.showErrorMessage('Failed to get help from OpenAI. Check the logs for details.');
//     }
// }

// async function analyzeTerminalOutput(lastCommandInfo: { command: string, output: string }, apiKey: string) {
//     const endpoint = 'https://api.openai.com/v1/chat/completions';
//     console.log(`Using endpoint: ${endpoint}`);
//     console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

//     try {
//         const openaiResponse = await axios.post(endpoint, {
//             model: "gpt-3.5-turbo",
//             messages: [
//                 { role: "system", content: "You are an efficient and helpful assistant for Git commands and terminal issues. Analyze the provided terminal output and suggest solutions if any issues are found." },
//                 { role: "user", content: `The last command executed was: ${lastCommandInfo.command}\nHere is the output:\n\n${lastCommandInfo.output}` }
//             ],
//             max_tokens: 300,
//             temperature: 0.5,
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${apiKey}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         const message = openaiResponse.data.choices[0].message.content.trim();
//         console.log(`OpenAI response: ${message}`);
//         vscode.window.showInformationMessage(`OpenAI Analysis: ${message}`);
//     } catch (error) {
//         console.error('Error', error);
//         vscode.window.showErrorMessage('Failed to analyze terminal output with OpenAI. Check the logs for details.');
//     }
// }

// async function getLastCommandInfo(): Promise<{ command: string, output: string } | null> {
//     const tempFilePath = path.join(__dirname, 'lastCommandOutput.txt');

//     if (fs.existsSync(tempFilePath)) {
//         const content = fs.readFileSync(tempFilePath, 'utf8');
//         const [command, output] = content.split('\nOUTPUT:\n');
//         return { command, output };
//     } else {
//         return null;
//     }
// }

// function logCommandOutput(command: string, output: string): void {
//     const tempFilePath = path.join(__dirname, 'lastCommandOutput.txt');
//     fs.writeFileSync(tempFilePath, `${command}\nOUTPUT:\n${output}`);
// }

// async function captureTerminalOutput(command: string): Promise<void> {
//     try {
//         const output = await executeCommand(command);
//         logCommandOutput(command, output);
//     } catch (error) {
//         logCommandOutput(command, `Error`);
//     }
// }

// export function deactivate() {}



import * as vscode from 'vscode';
import axios from 'axios';
// import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// dotenv.config();

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "git-helper" is now active!');

    let terminal = vscode.window.activeTerminal;
    if (!terminal) {
        terminal = vscode.window.createTerminal('Git Helper Terminal');
        terminal.show();
    }

    let disposable = vscode.commands.registerCommand('extension.helpWithGit', async () => {
        console.log('Command "Help with Git" executed');

        const apiKey = 'sk-proj-dpefHjcDYwF9wCnM8b7iT3BlbkFJ3YHqS0zNat0PpiK8wejt'; // Ensure you have this in your .env file
        if (!apiKey) {
            vscode.window.showErrorMessage('OpenAI API key is missing');
            return;
        }

        try {
            const gitInfo = await getGitInfo();
            vscode.window.showInformationMessage(`Git Info:\n${formatGitInfo(gitInfo)}`);

            const response = await vscode.window.showInputBox({ prompt: 'Ask your Git-related question or type "check terminal"' });
            if (response) {
                console.log(`User question: ${response}`);

                if (response.toLowerCase() === 'check terminal') {
                    const lastCommandInfo = await getLastCommandInfo();
                    if (lastCommandInfo) {
                        vscode.window.showInformationMessage(`Last Command: ${lastCommandInfo.command}\nOutput: ${lastCommandInfo.output}`);
                        await analyzeTerminalOutput(lastCommandInfo, apiKey);
                    } else {
                        vscode.window.showErrorMessage('No previous command found.');
                    }
                } else {
                    await getHelpFromOpenAI(response, apiKey, gitInfo);
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to retrieve Git info`);
        }
    });

    context.subscriptions.push(disposable);

    // Register a custom command to send text to the terminal and log it
    let sendCommandDisposable = vscode.commands.registerCommand('extension.sendTerminalCommand', async (command: string) => {
        if (!terminal) {
            terminal = vscode.window.createTerminal('Git Helper Terminal');
            terminal.show();
        }
        logCommandOutput(command, '');
        terminal.sendText(command);
        await captureTerminalOutput(command);
    });

    context.subscriptions.push(sendCommandDisposable);
}

async function getGitInfo(): Promise<any> {
    const gitCommands = {
        head: 'git rev-parse --abbrev-ref HEAD',
        branches: 'git branch -a',
        remotes: 'git remote -v',
        status: 'git status --short'
    };

    let gitInfo: { [key: string]: string } = {};

    for (const [key, command] of Object.entries(gitCommands)) {
        try {
            gitInfo[key] = await executeCommand(command);
        } catch (error) {
            gitInfo[key] = `Error`;
        }
    }

    return gitInfo;
}

function formatGitInfo(gitInfo: any): string {
    return `HEAD: ${gitInfo.head}\nBranches:\n${gitInfo.branches}\nRemotes:\n${gitInfo.remotes}\nStatus:\n${gitInfo.status}`;
}

function executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command ${command}:`, stderr);
                reject(new Error(stderr));
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

async function getHelpFromOpenAI(query: string, apiKey: string, gitInfo: any) {
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    console.log(`Using endpoint: ${endpoint}`);
    console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

    try {
        const openaiResponse = await axios.post(endpoint, {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: `You are an efficient and helpful assistant for Git commands. Keep your responses short, concise, and in plain text. Avoid formatting the code in bash or any other language. For example, if a user asks how to clone a repository, respond with: git clone <repository_url>. Replace <repository_url> with the actual URL of the repository. Focus on providing clear and straightforward instructions for each Git command. Here is the user's Git info:\n${formatGitInfo(gitInfo)}` },
                { role: "user", content: query }
            ],
            max_tokens: 150,
            temperature: 0.5,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const message = openaiResponse.data.choices[0].message.content.trim();
        console.log(`OpenAI response: ${message}`);
        vscode.window.showInformationMessage(`OpenAI Response:\n${message}`);
    } catch (error) {
        console.error('Error', error);
        vscode.window.showErrorMessage('Failed to get help from OpenAI. Check the logs for details.');
    }
}

async function analyzeTerminalOutput(lastCommandInfo: { command: string, output: string }, apiKey: string) {
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    console.log(`Using endpoint: ${endpoint}`);
    console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

    try {
        const openaiResponse = await axios.post(endpoint, {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an efficient and helpful assistant for Git commands and terminal issues. Analyze the provided terminal output and suggest solutions if any issues are found." },
                { role: "user", content: `The last command executed was:\n${lastCommandInfo.command}\nHere is the output:\n\n${lastCommandInfo.output}` }
            ],
            max_tokens: 300,
            temperature: 0.5,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const message = openaiResponse.data.choices[0].message.content.trim();
        console.log(`OpenAI response: ${message}`);
        vscode.window.showInformationMessage(`OpenAI Analysis:\n${message}`);
    } catch (error) {
        console.error('Error', error);
        vscode.window.showErrorMessage('Failed to analyze terminal output with OpenAI. Check the logs for details.');
    }
}

async function getLastCommandInfo(): Promise<{ command: string, output: string } | null> {
    const tempFilePath = path.join(__dirname, 'lastCommandOutput.txt');

    if (fs.existsSync(tempFilePath)) {
        const content = fs.readFileSync(tempFilePath, 'utf8');
        const [command, output] = content.split('\nOUTPUT:\n');
        return { command, output };
    } else {
        return null;
    }
}

function logCommandOutput(command: string, output: string): void {
    const tempFilePath = path.join(__dirname, 'lastCommandOutput.txt');
    fs.writeFileSync(tempFilePath, `${command}\nOUTPUT:\n${output}`);
}

async function captureTerminalOutput(command: string): Promise<void> {
    try {
        const output = await executeCommand(command);
        logCommandOutput(command, output);
    } catch (error) {
        logCommandOutput(command, `Error`);
    }
}

export function deactivate() {}

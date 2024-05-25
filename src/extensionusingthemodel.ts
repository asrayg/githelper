import * as vscode from 'vscode';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

export function activate(context: vscode.ExtensionContext) {
    let terminal = vscode.window.activeTerminal;
    if (!terminal) {
        terminal = vscode.window.createTerminal('GitHelper');
        terminal.show();
    }

    let disposable = vscode.commands.registerCommand('extension.helpWithGit', async () => {
        try {
            const gitInfo = await getGitInfo();
            vscode.window.showInformationMessage(`Git Info:\n${formatGitInfo(gitInfo)}`);

            const response = await vscode.window.showInputBox({ prompt: 'Ask your Git-related question or type "check terminal"' });
            if (response) {
                if (response.toLowerCase() === 'check terminal') {
                    const lastCommandInfo = await getLastCommandInfo();
                    if (lastCommandInfo) {
                        vscode.window.showInformationMessage(`Last Command: ${lastCommandInfo.command}\nOutput: ${lastCommandInfo.output}`);
                        await analyzeTerminalOutput(lastCommandInfo);
                    } else {
                        vscode.window.showErrorMessage('No previous command found.');
                    }
                } else {
                    await getHelpFromLocalModel(response, gitInfo);
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to retrieve Git info`);
        }
    });

    context.subscriptions.push(disposable);

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

async function getHelpFromLocalModel(query: string, gitInfo: any) {
    const endpoint = 'http://localhost:5000/ask';
    console.log(`Using endpoint: ${endpoint}`);

    try {
        const response = await axios.post(endpoint, {
            question: query,
            context: formatGitInfo(gitInfo)
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const message = response.data.answer;
        console.log(`GitHelper's response: ${message}`);
        vscode.window.showInformationMessage(`GitHelper's Response:\n${message}`);
    } catch (error) {
        console.error('Error', error);
        vscode.window.showErrorMessage('Failed to get help from the local model. Check the logs for details.');
    }
}

async function analyzeTerminalOutput(lastCommandInfo: { command: string, output: string }) {
    const endpoint = 'http://localhost:5000/ask';
    console.log(`Using endpoint: ${endpoint}`);

    try {
        const response = await axios.post(endpoint, {
            question: `Analyze the following terminal output for issues:\n${lastCommandInfo.command}\n${lastCommandInfo.output}`,
            context: ""
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const message = response.data.answer;
        console.log(`GitHelper's analysis: ${message}`);
        vscode.window.showInformationMessage(`GitHelper's Analysis:\n${message}`);
    } catch (error) {
        console.error('Error', error);
        vscode.window.showErrorMessage('Failed to analyze terminal output with the local model. Check the logs for details.');
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

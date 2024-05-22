import * as vscode from 'vscode';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "git-helper" is now active!');

    let disposable = vscode.commands.registerCommand('extension.helpWithGit', async () => {
        console.log('Command "Help with Git" executed');
        const terminal = vscode.window.activeTerminal;
        if (!terminal) {
            vscode.window.showInformationMessage('No active terminal found');
            return;
        }

        const response = await vscode.window.showInputBox({ prompt: 'Ask your Git-related question' });
        if (response) {
            console.log(`User question: ${response}`);
            const apiKey = 'sk-proj-6aonCYxzgsiH0SqgMrmBT3BlbkFJBzmjRuvqIfjN60LTvzOc';
            if (!apiKey) {
                vscode.window.showErrorMessage('OpenAI API key is missing');
                return;
            }

            const endpoint = 'https://api.openai.com/v1/chat/completions';
            console.log(`Using endpoint: ${endpoint}`);
            console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

            try {
                const openaiResponse = await axios.post(endpoint, {
                    model: "gpt-3.5-turbo",
                    messages: [
                        { "role": "system", "content": "You are an efficient and helpful assistant for Git commands. Keep your responses short and concise, ensuring everything is presented in plain text. Do not format the code in bash or any other language. For example, if a user asks how to clone a repository, respond with: git clone <repository_url> Replace <repository_url> with the URL of the repository you want to clone. Focus on providing clear, straightforward instructions for each Git command." },
                        { "role": "user", "content": response }
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
                terminal.sendText(message);
            } catch (error) {
                // if (error.response) {
                //     // The request was made and the server responded with a status code
                //     // that falls out of the range of 2xx
                //     console.error(`Error: ${error.response.status} - ${error.response.statusText}`);
                //     console.error(`Response data: ${JSON.stringify(error.response.data)}`);
                //     vscode.window.showErrorMessage(`Error: ${error.response.status} - ${error.response.statusText}`);
                // } else if (error.request) {
                //     // The request was made but no response was received
                //     console.error('Error: No response received');
                //     console.error(error.request);
                //     vscode.window.showErrorMessage('Error: No response received');
                // } else {
                //     // Something happened in setting up the request that triggered an Error
                //     console.error('Error', error.message);
                //     vscode.window.showErrorMessage(`Error: ${error.message}`);
                // }
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

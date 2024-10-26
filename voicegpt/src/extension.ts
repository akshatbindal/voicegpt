import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('voicegpt.voiceCommand', async () => {
        vscode.window.showInformationMessage('Listening for voice command...');
        console.log('Voice command activated, sending request to server...');

        try {
            // Send a request to the Node.js server to start transcription
            const response = await axios.get('http://localhost:3000/transcribe');
            const transcription = response.data.transcription;
            
            vscode.window.showInformationMessage(`Transcription: ${transcription}`);
            console.log('Transcription received:', transcription);
        } catch (error: any) {
            console.error('Error occurred:', error);
            vscode.window.showErrorMessage(`Error: ${error.message || 'An unknown error occurred'}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

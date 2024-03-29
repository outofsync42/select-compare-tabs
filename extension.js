const { log } = require('console');
const vscode = require('vscode');

function Extension() {

	let file1;
	let file2;

	/**
	 * @param {vscode.Uri} uri 
	 */
	this.selectForCompare = function (uri) {
		//set file 1
		file1 = uri
		//setContext compareEnabled = true
		vscode.commands.executeCommand('setContext', 'select-compare-tabs.compareEnabled', true);
	}

	/**
	 * @param {vscode.Uri} uri 
	 */
	this.compareWithSelected = function (uri) {
		//set file 2
		file2 = uri
		//open diff editor
		vscode.commands.executeCommand('vscode.diff', file1, file2);
		//setContext compareEnabled = false
		vscode.commands.executeCommand('setContext', 'select-compare-tabs.compareEnabled', false);
	}

	this.swapFiles = function () {
		//get visible editors in diff panel
		let selectedEditors = vscode.window.visibleTextEditors;
		//switch files and set
		
		if(typeof selectedEditors[2] !=='undefined'){
			file1 = selectedEditors[2].document.uri;
			file2 = selectedEditors[1].document.uri;
		} else {
			file1 = selectedEditors[1].document.uri;
			file2 = selectedEditors[0].document.uri;
		}

		//close diff editor
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		//open new diff editor
		vscode.commands.executeCommand('vscode.diff', file1, file2);
	}

}

function activate(context) {

	//INIT EXTENSION
	let ext = new Extension();

	//COMMANDS
	context.subscriptions.push(vscode.commands.registerCommand('select-compare-tabs.selectForCompare', function (event) {
		//selectForCompare
		ext.selectForCompare(event);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('select-compare-tabs.compareWithSelected', function (event) {
		//compareWithSelected
		ext.compareWithSelected(event);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('select-compare-tabs.swapFiles', function () {
		//swapFiles
		ext.swapFiles();
	}));

}

exports.activate = activate;
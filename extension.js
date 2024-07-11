const { log } = require("console");
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const os = require("os");

function Extension() {
  let file1;
  let file2;

  /**
   * @param {vscode.Uri} uri
   */
  this.selectForCompare = function (uri) {
    // Set file 1
    file1 = uri;
    // Set context compareEnabled = true
    vscode.commands.executeCommand("setContext", "select-compare-tabs.compareEnabled", true);
  };

  /**
   * @param {vscode.Uri} uri
   */
  this.compareWithSelected = function (uri) {
    // Set file 2
    file2 = uri;
    // Open diff editor
    if (file1 && file2) {
      vscode.commands.executeCommand("vscode.diff", file1, file2);
      // Set context compareEnabled = false
      vscode.commands.executeCommand("setContext", "select-compare-tabs.compareEnabled", false);
    } else {
      vscode.window.showErrorMessage("Both files must be selected for comparison.");
    }
  };

  this.swapFiles = function () {
    // Get visible editors in diff panel
    let selectedEditors = vscode.window.visibleTextEditors;
    // Switch files and set

    if (typeof selectedEditors[2] !== "undefined") {
      file1 = selectedEditors[2].document.uri;
      file2 = selectedEditors[1].document.uri;
    } else {
      file1 = selectedEditors[1].document.uri;
      file2 = selectedEditors[0].document.uri;
    }

    // Close diff editor
    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    // Open new diff editor
    if (file1 && file2) {
      vscode.commands.executeCommand("vscode.diff", file1, file2);
    } else {
      vscode.window.showErrorMessage("Both files must be selected for swapping.");
    }
  };

  this.compareFileWithClipboard = async function (uri) {
    try {
      // Set file1 to the selected file
      file1 = uri;

      // Get the clipboard contents
      const clipboardContents = await vscode.env.clipboard.readText();

      // Get the file extension of the first file
      const fileExtension = path.extname(file1.fsPath);

      // Get the base file path from the configuration
      const config = vscode.workspace.getConfiguration("selectCompareTabs");
      let baseFilePath = config.get("clipboardFilePath");

      if (!baseFilePath) {
        vscode.window.showErrorMessage("Clipboard file path is not set in the configuration.");
        return;
      }

      // Expand tilde to home directory
      if (baseFilePath.startsWith("~")) {
        baseFilePath = path.join(os.homedir(), baseFilePath.slice(1));
      }

      // Construct the full file path with the appropriate extension
      const filePath = baseFilePath.replace(/(\.[^/.]+)?$/, fileExtension);

      // Ensure the directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save the clipboard contents to the static file
      fs.writeFileSync(filePath, clipboardContents);

      // Create a URI for the static file
      file2 = vscode.Uri.file(filePath);

      // Open diff editor
      if (file1 && file2) {
        vscode.commands.executeCommand("vscode.diff", file1, file2);
        // Set context compareEnabled = false
        vscode.commands.executeCommand("setContext", "select-compare-tabs.compareEnabled", false);
      } else {
        vscode.window.showErrorMessage("Both files must be selected for comparison.");
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error comparing file with clipboard: ${error.message}`);
    }
  };
}

function activate(context) {
  // INIT EXTENSION
  let ext = new Extension();

  // COMMANDS
  context.subscriptions.push(
    vscode.commands.registerCommand("select-compare-tabs.selectForCompare", function (event) {
      // selectForCompare
      ext.selectForCompare(event);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("select-compare-tabs.compareWithSelected", function (event) {
      // compareWithSelected
      ext.compareWithSelected(event);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("select-compare-tabs.compareFileWithClipboard", function (event) {
      // compareFileWithClipboard
      ext.compareFileWithClipboard(event);
    })
  );
}

exports.activate = activate;

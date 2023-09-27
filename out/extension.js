"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    // Common properties for completion items
    const otuiCommonProperties = [
        { label: 'anchors.centerIn', detail: 'Centers the component in the parent component' },
        { label: 'font', detail: 'Sets the font of the component' },
        { label: 'size', detail: 'Sets the size of the component' },
        { label: 'opacity', detail: 'Sets the opacity of the component' },
        { label: 'color', detail: 'Sets the color of the component' },
        { label: 'text-offset', detail: 'Sets the text offset in the component' },
        { label: 'text-align', detail: 'Sets the text alignment in the component' },
        { label: 'image-source', detail: 'Sets the image source of the component' },
        { label: 'image-border', detail: 'Sets the image border of the component' },
        { label: 'padding-top', detail: 'Sets the top padding of the component' },
        { label: 'padding-left', detail: 'Sets the left padding of the component' },
        { label: 'padding-right', detail: 'Sets the right padding of the component' },
        { label: 'padding-bottom', detail: 'Sets the bottom padding of the component' },
        // ... Other common properties
    ];
    // Register Completion Item Provider
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('otui', {
        provideCompletionItems(document, position) {
            // Return all common properties as completion items
            return otuiCommonProperties.map(prop => {
                const item = new vscode.CompletionItem(prop.label, vscode.CompletionItemKind.Property);
                item.detail = prop.detail;
                return item;
            });
        },
        resolveCompletionItem(item) {
            item.documentation = new vscode.MarkdownString(`Documentation for \`${item.label}\``);
            return item;
        }
    }));
    // Register Command to Insert Component Template
    context.subscriptions.push(vscode.commands.registerCommand('extension.insertComponentTemplate', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.insertSnippet(new vscode.SnippetString('${1:ComponentName} < ${2:ParentComponent}\n  prop: value'));
        }
    }));
}
exports.activate = activate;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const otuiCommonProperties_1 = require("./constants/otuiCommonProperties");
const otuiFunctionTriggerProperties_1 = require("./constants/otuiFunctionTriggerProperties");
const otmodCommonProperties_1 = require("./constants/otmodCommonProperties");
// Função para obter todas as funções de um arquivo `.lua`
function getFunctionsFromLuaFile(luaFilePath) {
    const data = fs.readFileSync(luaFilePath, 'utf8');
    const functionMatches = data.match(/function\s+(\w+)\s*\(/g);
    const functionNames = functionMatches ? functionMatches.map((func) => func.replace(/function\s+|\s*\(/g, '')) : [];
    return functionNames;
}
function activate(context) {
    // Novo CompletionItemProvider para funções Lua
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('otui', {
        provideCompletionItems(document) {
            const luaFilePath = document.fileName.replace(/\.otui$/, '.lua');
            const functionNames = getFunctionsFromLuaFile(luaFilePath);
            return functionNames.map(name => {
                const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
                item.insertText = new vscode.SnippetString(name + '($0)');
                return item;
            });
        },
    }));
    // Register Completion Item Provider to OTUI
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider("otui", {
        provideCompletionItems(document, position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            if (!linePrefix.trim()) {
                // Return all common properties as completion items
                return otuiCommonProperties_1.default.map((prop) => {
                    const item = new vscode.CompletionItem(prop.label, vscode.CompletionItemKind.Property);
                    item.detail = prop.detail;
                    item.insertText = new vscode.SnippetString(prop.insertText + "$0");
                    return item;
                });
            }
            else {
                // Verifica se o prefixo da linha corresponde ao início de qualquer rótulo de propriedade
                const matchingProperties = otuiCommonProperties_1.default.filter(prop => prop.label.startsWith(linePrefix.trim()));
                if (matchingProperties.length > 0) {
                    // Se corresponder, retorne as propriedades correspondentes como itens de conclusão
                    return matchingProperties.map(prop => {
                        const item = new vscode.CompletionItem(prop.label, vscode.CompletionItemKind.Property);
                        item.detail = prop.detail;
                        item.insertText = new vscode.SnippetString(prop.insertText + "$0");
                        return item;
                    });
                }
                else {
                    // Verifica se o prefixo da linha corresponde ao insertText de qualquer propriedade anchors
                    const anchorProperty = otuiCommonProperties_1.default.find(prop => prop.insertText.trim() === linePrefix.trim());
                    if (anchorProperty === null || anchorProperty === void 0 ? void 0 : anchorProperty.relatedValues) {
                        // Se corresponder, retorne os relatedValues como itens de conclusão
                        return anchorProperty.relatedValues.map(value => {
                            const item = new vscode.CompletionItem(value.label, vscode.CompletionItemKind.Value);
                            item.detail = value.detail;
                            item.insertText = new vscode.SnippetString(value.insertText + "$0");
                            return item;
                        });
                    }
                    else if (otuiFunctionTriggerProperties_1.otuiFunctionTriggerProperties.includes(linePrefix.trim())) {
                        // Se @onClick foi digitado, obtenha todas as funções do arquivo Lua correspondente
                        const luaFilePath = document.fileName.replace(/\.otui$/, '.lua');
                        const functionNames = getFunctionsFromLuaFile(luaFilePath);
                        return functionNames.map(funcName => {
                            const item = new vscode.CompletionItem(funcName, vscode.CompletionItemKind.Function);
                            item.insertText = new vscode.SnippetString(funcName + "()");
                            return item;
                        });
                    }
                }
            }
        },
        resolveCompletionItem(item) {
            item.documentation = new vscode.MarkdownString(`Documentation for \`${item.label}\``);
            return item;
        },
    }));
    //Register Completion Item Provider to OTMOD
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider("otmod", {
        provideCompletionItems(document, position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            if (!linePrefix.trim()) {
                return otmodCommonProperties_1.default.map((prop) => {
                    const item = new vscode.CompletionItem(prop.label, vscode.CompletionItemKind.Property);
                    item.detail = prop.detail;
                    item.insertText = new vscode.SnippetString(prop.insertText + "$0");
                    return item;
                });
            }
        },
        resolveCompletionItem(item) {
            item.documentation = new vscode.MarkdownString(`Documentation for \`${item.label}\``);
            return item;
        },
    }));
    // Register Command to Insert Component Template
    context.subscriptions.push(vscode.commands.registerCommand("extension.insertComponentTemplate", () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.insertSnippet(new vscode.SnippetString("${1:ComponentName} < ${2:ParentComponent}\n  prop: value"));
        }
    }));
}
exports.activate = activate;

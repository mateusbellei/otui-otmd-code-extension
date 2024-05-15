"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    context.subscriptions.push(vscode.languages.registerDefinitionProvider({ language: 'otui', scheme: 'file' }, new LuaFunctionDefinitionProvider()));
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('otui', new OTUIFormatter()), vscode.languages.registerDocumentRangeFormattingEditProvider('otui', new OTUIFormatter()));
}
exports.activate = activate;
class LuaFunctionDefinitionProvider {
    provideDefinition(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const line = document.lineAt(position);
            const lineText = line.text;
            const functionNameMatch = lineText.match(/@[\w]+: ([\w.]+)\(/);
            if (functionNameMatch) {
                const fullFunctionName = functionNameMatch[1];
                const functionName = fullFunctionName.split('.').pop() || ""; // Usa string vazia como valor padrão
                const luaFilePath = document.fileName.replace(/\.otui$/, '.lua');
                // Use a função existente para obter os nomes das funções do arquivo Lua
                const functionNames = this.getFunctionsFromLuaFile(luaFilePath);
                if (functionNames.includes(functionName)) {
                    const luaDocument = yield vscode.workspace.openTextDocument(luaFilePath);
                    const luaText = luaDocument.getText();
                    const functionRegex = new RegExp(`function\\s+${functionName}\\s*\\(`, 'g');
                    let match;
                    while ((match = functionRegex.exec(luaText)) !== null) {
                        const startPos = luaDocument.positionAt(match.index);
                        const endPos = luaDocument.positionAt(match.index + match[0].length);
                        return new vscode.Location(vscode.Uri.file(luaFilePath), new vscode.Range(startPos, endPos));
                    }
                }
            }
        });
    }
    getFunctionsFromLuaFile(luaFilePath) {
        try {
            const data = fs.readFileSync(luaFilePath, 'utf8');
            const functionMatches = data.match(/function\s+([\w.]+)\s*\(/g);
            return functionMatches ? functionMatches.map(func => {
                const name = func.replace(/function\s+|\s*\(/g, '').split('.').pop();
                return name || ""; // Usa string vazia como valor padrão para evitar undefined
            }) : [];
        }
        catch (error) {
            console.error("Error reading Lua file:", error);
            return [];
        }
    }
}
class OTUIFormatter {
    provideDocumentFormattingEdits(document) {
        return this.formatText(document, null);
    }
    provideDocumentRangeFormattingEdits(document, range) {
        return this.formatText(document, range);
    }
    formatText(document, range) {
        const edits = [];
        let previousLineWasComponent = false;
        let componentIndentationLevel = 0;
        const startLine = range ? range.start.line : 0;
        const endLine = range ? range.end.line : document.lineCount - 1;
        for (let i = startLine; i <= endLine; i++) {
            const line = document.lineAt(i);
            const trimmedLine = line.text.trim();
            if (this.isComponentDeclaration(trimmedLine)) {
                // Reset the flag if this is a component declaration
                previousLineWasComponent = true;
                componentIndentationLevel = line.firstNonWhitespaceCharacterIndex;
            }
            else if (previousLineWasComponent) {
                // Apply two-space indentation if the previous line was a component
                const desiredIndentation = ' '.repeat(componentIndentationLevel + 2); // Two spaces beyond the component's indentation
                edits.push(vscode.TextEdit.replace(new vscode.Range(i, 0, i, line.firstNonWhitespaceCharacterIndex), desiredIndentation));
                previousLineWasComponent = false;
            }
        }
        return edits;
    }
    isComponentDeclaration(lineText) {
        // Check if the line starts with a capital letter and resembles a component declaration
        return /^[A-Z]/.test(lineText) || lineText.includes('<');
    }
}

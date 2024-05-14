
import * as vscode from "vscode";
import * as fs from 'fs';
import otuiCommonProperties from "./constants/otuiCommonProperties";
import { otuiFunctionTriggerProperties } from './constants/otuiFunctionTriggerProperties';
import otmodCommonProperties from "./constants/otmodCommonProperties";


// Função para obter todas as funções de um arquivo `.lua`
function getFunctionsFromLuaFile(luaFilePath: string): string[] {
  const data = fs.readFileSync(luaFilePath, 'utf8');
  const functionMatches = data.match(/function\s+(\w+)\s*\(/g);
  const functionNames = functionMatches ? functionMatches.map((func: string) => func.replace(/function\s+|\s*\(/g, '')) : [];
  return functionNames;
}

export function activate(context: vscode.ExtensionContext) {

  // Novo CompletionItemProvider para funções Lua
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider('otui', {
      provideCompletionItems(document: vscode.TextDocument) {
        const luaFilePath = document.fileName.replace(/\.otui$/, '.lua');
        const functionNames = getFunctionsFromLuaFile(luaFilePath);
        return functionNames.map(name => {
          const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
          item.insertText = new vscode.SnippetString(name + '($0)');
          return item;
        });
      },
    })
  );

  // Register Completion Item Provider to OTUI
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider("otui", {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (!linePrefix.trim()) {
          // Return all common properties as completion items
          return otuiCommonProperties.map((prop) => {
            const item = new vscode.CompletionItem(
              prop.label,
              vscode.CompletionItemKind.Property
            );
            item.detail = prop.detail;
            item.insertText = new vscode.SnippetString(prop.insertText + "$0");
            return item;
          });
        } else {
          // Verifica se o prefixo da linha corresponde ao início de qualquer rótulo de propriedade
          const matchingProperties = otuiCommonProperties.filter(
            prop => prop.label.startsWith(linePrefix.trim())
          );
          if (matchingProperties.length > 0) {
            // Se corresponder, retorne as propriedades correspondentes como itens de conclusão
            return matchingProperties.map(prop => {
              const item = new vscode.CompletionItem(
                prop.label,
                vscode.CompletionItemKind.Property
              );
              item.detail = prop.detail;
              item.insertText = new vscode.SnippetString(prop.insertText + "$0");
              return item;
            });
          } else {
            // Verifica se o prefixo da linha corresponde ao insertText de qualquer propriedade anchors
            const anchorProperty = otuiCommonProperties.find(
              prop => prop.insertText.trim() === linePrefix.trim()
            );
            if (anchorProperty?.relatedValues) {
              // Se corresponder, retorne os relatedValues como itens de conclusão
              return anchorProperty.relatedValues.map(value => {
                const item = new vscode.CompletionItem(
                  value.label,
                  vscode.CompletionItemKind.Value
                );
                item.detail = value.detail;
                item.insertText = new vscode.SnippetString(value.insertText + "$0");
                return item;
              });
            } else if (otuiFunctionTriggerProperties.includes(linePrefix.trim())) {
              // Se @onClick foi digitado, obtenha todas as funções do arquivo Lua correspondente
              const luaFilePath = document.fileName.replace(/\.otui$/, '.lua');
              const functionNames = getFunctionsFromLuaFile(luaFilePath);
              return functionNames.map(funcName => {
                const item = new vscode.CompletionItem(
                  funcName,
                  vscode.CompletionItemKind.Function
                );
                item.insertText = new vscode.SnippetString(funcName + "()");
                return item;
              });
            }
          }
        }
      },      
      resolveCompletionItem(item: vscode.CompletionItem) {
        item.documentation = new vscode.MarkdownString(`Documentation for \`${item.label}\``);
        return item;
      },
    })
  );

  //Register Completion Item Provider to OTMOD
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider("otmod", {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (!linePrefix.trim()) {
          return otmodCommonProperties.map((prop) => {
            const item = new vscode.CompletionItem(
              prop.label,
              vscode.CompletionItemKind.Property
            );
            item.detail = prop.detail;
            item.insertText = new vscode.SnippetString(prop.insertText + "$0");
            return item;
          });
        }
      },
      resolveCompletionItem(item: vscode.CompletionItem) {
        item.documentation = new vscode.MarkdownString(`Documentation for \`${item.label}\``);
        return item;
      },
    })
  );

  // Register Command to Insert Component Template
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.insertComponentTemplate", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        editor.insertSnippet(
          new vscode.SnippetString(
            "${1:ComponentName} < ${2:ParentComponent}\n  prop: value"
          )
        );
      }
    })
  );

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      { language: 'otui', scheme: 'file' },
      new LuaFunctionDefinitionProvider()
    )
  );
}

class LuaFunctionDefinitionProvider implements vscode.DefinitionProvider {
  public async provideDefinition(
    document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken
  ): Promise<vscode.Definition | undefined> {
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
        const luaDocument = await vscode.workspace.openTextDocument(luaFilePath);
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
  }

  private getFunctionsFromLuaFile(luaFilePath: string): string[] {
    try {
      const data = fs.readFileSync(luaFilePath, 'utf8');
      const functionMatches = data.match(/function\s+([\w.]+)\s*\(/g);
      return functionMatches ? functionMatches.map(func => {
        const name = func.replace(/function\s+|\s*\(/g, '').split('.').pop();
        return name || ""; // Usa string vazia como valor padrão para evitar undefined
      }) : [];
    } catch (error) {
      console.error("Error reading Lua file:", error);
      return [];
    }
  }
}
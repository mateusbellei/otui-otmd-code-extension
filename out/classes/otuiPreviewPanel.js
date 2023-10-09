"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const otuiParser_1 = require("../utils/otuiParser"); // Ajuste o caminho se necessário
class OtuiPreviewPanel {
    static createOrShow(extensionUri) {
        const column = vscode.ViewColumn.Beside;
        // Se já tivermos um painel, apenas revele-o
        if (OtuiPreviewPanel.currentPanel) {
            OtuiPreviewPanel.currentPanel._panel.reveal(column);
            OtuiPreviewPanel.currentPanel._update();
            return;
        }
        // Caso contrário, crie um novo painel
        const panel = vscode.window.createWebviewPanel(OtuiPreviewPanel.viewType, 'OTUI Preview', column, {
            enableScripts: true,
        });
        OtuiPreviewPanel.currentPanel = new OtuiPreviewPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        // Atualize o conteúdo do painel
        this._update();
        // Ouça quando o painel é descartado
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Atualize o conteúdo quando o editor ativo muda
        vscode.window.onDidChangeActiveTextEditor(() => this._update(), null, this._disposables);
    }
    dispose() {
        OtuiPreviewPanel.currentPanel = undefined;
        // Limpe nossos recursos
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update() {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'otui') {
            const parsedContent = (0, otuiParser_1.parseOTUI)(editor.document.getText());
            // Aqui, você pode transformar o parsedContent em HTML e definir no webview
            this._panel.webview.html = this._getHtmlForWebview(parsedContent);
        }
    }
    _getHtmlForWebview(parsedContent) {
        // Transforme o parsedContent em HTML aqui
        // Por enquanto, apenas retornando uma representação string do conteúdo
        return `<html><body>${JSON.stringify(parsedContent)}</body></html>`;
    }
}
OtuiPreviewPanel.viewType = 'otuiPreview';
exports.default = OtuiPreviewPanel;

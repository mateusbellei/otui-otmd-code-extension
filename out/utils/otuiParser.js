"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOTUI = void 0;
const Panel_1 = require("../components/Panel");
function parseOTUI(content) {
    const lines = content.split('\n');
    const root = []; // Explicitamente definido como uma união de Panel ou null
    let currentComponent = null; // Inicializado como null
    for (const line of lines) {
        if (line.trim().startsWith('Panel')) {
            currentComponent = new Panel_1.Panel({});
            root.push(currentComponent);
        }
        else if (line.trim().startsWith('height:') && currentComponent) {
            currentComponent.height = parseInt(line.split(':')[1].trim());
        } // ... adicione mais propriedades conforme necessário
    }
    return root;
}
exports.parseOTUI = parseOTUI;

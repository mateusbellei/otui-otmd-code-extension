"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Panel = void 0;
class Panel {
    constructor(properties) {
        this.height = properties.height || 0;
        this.focusable = properties.focusable || false;
        this.background = properties.background || 'transparent';
        this.focus = properties.focus || {};
    }
    toHTML() {
        let style = `height: ${this.height}px; background-color: ${this.background};`;
        if (this.focusable) {
            style += 'cursor: pointer;';
        }
        return `<div class="otui-panel" style="${style}"></div>`;
    }
}
exports.Panel = Panel;

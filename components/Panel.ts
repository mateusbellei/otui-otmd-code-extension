export class Panel {
  height: number;
  focusable: boolean;
  background: string;
  focus: { background: string };

  constructor(properties: any) {
      this.height = properties.height || 0;
      this.focusable = properties.focusable || false;
      this.background = properties.background || 'transparent';
      this.focus = properties.focus || {};
  }

  toHTML(): string {
      let style = `height: ${this.height}px; background-color: ${this.background};`;
      if (this.focusable) {
          style += 'cursor: pointer;';
      }
      return `<div class="otui-panel" style="${style}"></div>`;
  }
}

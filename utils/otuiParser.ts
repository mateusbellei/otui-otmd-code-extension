import { Panel } from '../components/Panel';

export function parseOTUI(content: string): any {
    const lines = content.split('\n');
    const root: (Panel | null)[] = [];  // Explicitamente definido como uma união de Panel ou null
    let currentComponent: Panel | null = null;  // Inicializado como null

    for (const line of lines) {
        if (line.trim().startsWith('Panel')) {
            currentComponent = new Panel({});
            root.push(currentComponent);
        } else if (line.trim().startsWith('height:') && currentComponent) {
            currentComponent.height = parseInt(line.split(':')[1].trim());
        } // ... adicione mais propriedades conforme necessário
    }

    return root;
}

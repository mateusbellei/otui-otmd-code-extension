import { parseOTUI } from '../utils/otuiParser';  // Atualize o caminho de importação conforme necessário

const otuiContent = `
Panel
  height: 100
  // ... (o restante do seu conteúdo OTUI)
`;

const parsedComponents = parseOTUI(otuiContent);
console.log(parsedComponents);
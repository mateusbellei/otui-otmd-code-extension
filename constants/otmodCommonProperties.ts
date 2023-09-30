type OtmodProperty = {
  label: string;
  detail: string;
  insertText: string;
};

const otmodCommonProperties: OtmodProperty[] = [
  {
    label: "name",
    detail: "Define a name for the module",
    insertText: "name: ",
  },
  {
    label: "author",
    detail: "Define the author of the module",
    insertText: "author: ",
  },
  {
    label: "sandboxed",
    detail: "Define if the module is sandboxed true / false",
    insertText: "sandboxed: true",
  },
  {
    label: "scripts",
    detail: "Define the scripts of the module",
    insertText: "scripts: [ ]",
  },
  {
    label: "dependencies",
    detail: "Define what modules this module depends on",
    insertText: "dependencies: [ ]",
  },
  {
    label: "load-later",
    detail: "Define what modules will be loaded after this module",
    insertText: "load-later: \n - module1\n - module2",
  },
  {
    label: "@onLoad",
    detail: "Define the onLoad event of the module",
    insertText: "@onLoad: ",
  },
  {
    label: "@onUnload",
    detail: "Define the onUnload event of the module",
    insertText: "@onUnload: ",
  },
  {
    label: "autoload",
    detail: "Define if the module will be loaded automatically",
    insertText: "autoload: true",
  },
  {
    label: "autoload-priority",
    detail: "Define the autoload priority of the module",
    insertText: "autoload-priority: ",
  },
];

export default otmodCommonProperties;
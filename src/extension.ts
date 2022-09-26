// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as tn from './treeNode';
import * as ut from './utils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "markdown-outline-helper" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const d1 = vscode.commands.registerCommand('markdown-outline-helper.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World from markdown-outline-helper!');
  });
  const d2 = vscode.commands.registerTextEditorCommand('markdown-outline-helper.convertHeadingToList', (app: vscode.TextEditor) => {
    const { start: startDir, end: endDir, isAllEmpty } = inspectRange(app);
    if (isAllEmpty) { return; }
    const oldRng = app.selection;
    const { start } = adjustRange(app, startDir, oldRng.start);
    const { end } = adjustRange(app, endDir, oldRng.end);
    const rng = oldRng.with(start, end);
    app.edit(ed => {
      const root: tn.ISortable = new tn.HeadingsPrintHier();
      const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
      const lines = [...readLines(app, start.line, end.line)];
      lines.forEach(ut.parseTreeItr, itrCtxt);
      const qq = ut.printTree(root);
      ed.delete(rng);
      ed.insert(start, qq.slice(0, -1));
    });
  });
  const d3 = vscode.commands.registerTextEditorCommand('markdown-outline-helper.convertListToHeading', (app: vscode.TextEditor) => {
    const { start: startDir, end: endDir, isAllEmpty } = inspectRange(app);
    if (isAllEmpty) { return; }
    const oldRng = app.selection;
    const { start } = adjustRange(app, startDir, oldRng.start);
    const { end } = adjustRange(app, endDir, oldRng.end);
    const rng = oldRng.with(start, end);
    app.edit(ed => {
      const root: tn.ISortable = new tn.TreeNodePrintHeading();
      const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
      const lines = [...readLines(app, start.line, end.line)];
      lines.forEach(ut.parseTreeItr, itrCtxt);
      const qq = ut.printTree(root);
      ed.delete(rng);
      ed.insert(start, qq.slice(0, -1));
    });
  });
  const d4 = vscode.commands.registerTextEditorCommand('markdown-outline-helper.sortList', (app: vscode.TextEditor) => {
    const { start: startDir, end: endDir, isAllEmpty } = inspectRange(app);
    if (isAllEmpty) { return; }
    const oldRng = app.selection;
    const { start } = adjustRange(app, startDir, oldRng.start);
    const { end } = adjustRange(app, endDir, oldRng.end);
    const rng = oldRng.with(start, end);
    app.edit(ed => {
      const root: tn.ISortable = new tn.TreeNodePrintHier();
      const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
      const lines = [...readLines(app, start.line, end.line)];
      lines.forEach(ut.parseTreeItr, itrCtxt);
      const qq = ut.printTree(root);
      ed.delete(rng);
      ed.insert(start, qq.slice(0, -1));
    });
  });
  const d5 = vscode.commands.registerTextEditorCommand('markdown-outline-helper.sortListAndConvertToFlat', (app: vscode.TextEditor) => {
    const { start: startDir, end: endDir, isAllEmpty } = inspectRange(app);
    if (isAllEmpty) { return; }
    const oldRng = app.selection;
    const { start } = adjustRange(app, startDir, oldRng.start);
    const { end } = adjustRange(app, endDir, oldRng.end);
    const rng = oldRng.with(start, end);
    app.edit(ed => {
      const root: tn.ISortable = new tn.TreeNodePrintFlat();
      const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
      const lines = [...readLines(app, start.line, end.line)];
      lines.forEach(ut.parseTreeItr, itrCtxt);
      const qq = ut.printTree(root);
      ed.delete(rng);
      ed.insert(start, qq.slice(0, -1));
    });
  });

  context.subscriptions.push(d1, d2, d3, d4, d5);
}
function adjustRange(app: vscode.TextEditor, searchDirection: SearchDirection, position: vscode.Position): vscode.Range {
  let ln: number = position.line;
  const doc = app.document;
  if (searchDirection & SearchDirection.up) {
    while (--ln >= 0
      && breakCriteria(doc, ln, searchDirection)) { /*empty*/ }
    if (isUntilBlank(searchDirection)) { ++ln; }
  } else {
    while (++ln < doc.lineCount
      && breakCriteria(doc, ln, searchDirection)) { /*empty*/ }
    if (isUntilBlank(searchDirection)) { --ln; }
  }
  return doc.lineAt(ln).range;
}
enum SearchDirection {
  none           = 0b000, //0
  up             = 0b010, //2
  untilText      = 0b100, //4
  upUntilText    = 0b111, //7
  upUntilBlank   = 0b011, //3
  downUntilText  = 0b101, //5
  downUntilBlank = 0b001, //1
}
type DoSearchUp = {
  start: SearchDirection;
  end: SearchDirection;
  isAllEmpty: boolean;
};
type LineEmpty = {
  startEmpty: boolean;
  endEmpty: boolean;
  isAllEmpty: boolean;
};
function breakCriteria(doc: vscode.TextDocument, ln: number, searchDirection: SearchDirection) {
  // equivalent to --> !(+((searchDirection & SearchDirection.untilText) > 0) ^ +doc.lineAt(ln).isEmptyOrWhitespace);
  return (searchDirection & SearchDirection.untilText) ?
    doc.lineAt(ln).isEmptyOrWhitespace :
    !doc.lineAt(ln).isEmptyOrWhitespace;
}

function isUntilBlank(searchDirection: SearchDirection) {
  return !(searchDirection & SearchDirection.untilText);
}

function inspectRange(app: vscode.TextEditor): DoSearchUp {
  const { startEmpty, endEmpty, isAllEmpty } = checkEmpty(app);
  const rtn: DoSearchUp = { start: SearchDirection.none, end: SearchDirection.none, isAllEmpty };
  if (rtn.isAllEmpty) { return rtn; }
  rtn.start = startEmpty ? SearchDirection.downUntilText : SearchDirection.upUntilBlank; //true Down, false Up
  rtn.end = endEmpty ? SearchDirection.upUntilText : SearchDirection.downUntilBlank;     //true Up,   false Down
  return rtn;
}
function checkEmpty(app: vscode.TextEditor): LineEmpty {
  const rng = app.selection;
  const doc = app.document;
  const rtn: LineEmpty = { startEmpty: false, endEmpty: false, isAllEmpty: false };
  rtn.isAllEmpty = rng.isSingleLine ?
    doc.lineAt(rng.start.line).isEmptyOrWhitespace :
    /^\s*$/.test(app.document.getText(rng));
  if (rtn.isAllEmpty) { return rtn; }
  const { start, end } = rng;
  rtn.startEmpty = doc.lineAt(start.line).isEmptyOrWhitespace;
  rtn.endEmpty = doc.lineAt(end.line).isEmptyOrWhitespace;
  return rtn;
}
function* readLines(app: vscode.TextEditor, start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield app.document.lineAt(i).text;
  }
}
// this method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() { }

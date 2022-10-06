import * as vscode from 'vscode';
import * as tn from './treeNode';
import * as ut from './utils';
import * as configs from './configs';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    registerEditorCommand('convertHeadingsToList', 'GitHubHeadingToList'),
    registerEditorCommand('convertListToHeadings', 'GitHubListToHeading'),
    registerEditorCommand('sortList', 'LogSeqList'),
    registerEditorCommand('sortAndFlattenList', 'LogSeqFlatList'));
}
function registerEditorCommand(cmdId: string, kind: tn.TreeNodeTypes): vscode.Disposable {
  return vscode.commands.registerTextEditorCommand(`markdown-outline-helper.${cmdId}`, (app: vscode.TextEditor) => {
    const { start: startDir, end: endDir, isAllEmpty } = inspectRange(app);
    if (isAllEmpty) { return; }
    const oldRng = app.selection;
    const { start } = adjustRange(app, startDir, oldRng.start);
    const { end } = adjustRange(app, endDir, oldRng.end);
    const newRng = oldRng.with(start, end);
    configs.refreshConfiguration();
    app.edit(ed => {
      const root: tn.ISortable = tn.treeNodeFactory(kind);
      const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
      ut.parseTreeFromLines([...readLines(app, start.line, end.line)], itrCtxt);
      const text = ut.printTree(root);
      ed.delete(newRng);
      ed.insert(start, text.slice(0, -1));
    });
  });
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

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() { }

import * as vscode from 'vscode';

export function inspectRange(app: vscode.TextEditor): DoSearchUp {
  const { startEmpty, endEmpty, isAllEmpty } = checkEmpty(app);
  const rtn: DoSearchUp = { start: SearchDirection.none, end: SearchDirection.none, isAllEmpty };
  if (rtn.isAllEmpty) { return rtn; }
  rtn.start = startEmpty ? SearchDirection.downUntilText : SearchDirection.upUntilBlank; //true Down, false Up
  rtn.end = endEmpty ? SearchDirection.upUntilText : SearchDirection.downUntilBlank;     //true Up,   false Down
  return rtn;
}

export function getNewRange(app: vscode.TextEditor, startDir: SearchDirection, endDir: SearchDirection) {
  const oldRng = app.selection;
  const { start } = adjustRange(app, startDir, oldRng.start);
  const { end } = adjustRange(app, endDir, oldRng.end);
  return oldRng.with(start, end);
}

export function* readLines(app: vscode.TextEditor, start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield app.document.lineAt(i).text;
  }
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

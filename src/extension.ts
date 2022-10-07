import * as vscode from 'vscode';
import * as tn from './treeNode';
import * as ut from './iteratorUtils';
import * as ru from './rangeUtils';
import * as cfg from './configs';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    registerToggleCommand('toggleHeadingsAndList'),
    registerNonToggleCommand('sortList', 'LogSeqList'),
    registerNonToggleCommand('sortAndFlattenList', 'LogSeqFlatList'));
}
function registerNonToggleCommand(cmdId: string, kind: tn.TreeNodeTypes): vscode.Disposable {
  return vscode.commands.registerTextEditorCommand(`markdown-outline-helper.${cmdId}`, (app: vscode.TextEditor) => {
    const { start: startDir, end: endDir, isAllEmpty } = ru.inspectRange(app);
    if (isAllEmpty) { return; }
    const newRng = ru.getNewRange(app, startDir, endDir);
    app.edit(editRange(kind, app, newRng));
  });
}

function registerToggleCommand(cmdId: string): vscode.Disposable {
  return vscode.commands.registerTextEditorCommand(`markdown-outline-helper.${cmdId}`, (app: vscode.TextEditor) => {
    const { start: startDir, end: endDir, isAllEmpty } = ru.inspectRange(app);
    if (isAllEmpty) { return; }
    const newRng = ru.getNewRange(app, startDir, endDir);
    const kind = peekRangeGetKind(app, newRng);
    app.edit(editRange(kind, app, newRng));
  });
}

function editRange(kind: tn.TreeNodeTypes, app: vscode.TextEditor, newRng: vscode.Range): (editBuilder: vscode.TextEditorEdit) => void {
  return ed => {
    cfg.refreshConfiguration();
    const root: tn.ITreeNode = tn.treeNodeFactory(kind);
    const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
    ut.parseTreeFromLines([...ru.readLines(app, newRng.start.line, newRng.end.line)], itrCtxt);
    const text = ut.printTree(root);
    ed.delete(newRng);
    ed.insert(newRng.start, text.slice(0, -1));
  };
}

function peekRangeGetKind(app: vscode.TextEditor, newRng: vscode.Range): tn.TreeNodeTypes {
  const txt = app.document.lineAt(newRng.start.line).text.trimStart();
  switch (txt[0]) {
    case '#': return 'GitHubHeadingToList';
    case '-': return 'GitHubListToHeading';
    default: throw new Error(`Unknown prefix type "${txt[0]}"!`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() { }


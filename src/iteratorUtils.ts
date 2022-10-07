/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as cfg from "./configs";
import * as tn from "./treeNode";

interface ReturnString {
  result: string
}
export class ItrContext {
  constructor(root: tn.ITreeNode) {
    this.nodeStack = [root];
    this.sortLevel = cfg.get<number>(cfg.KeyEnum.sortStartLevel) - 1; // -1 based, root start from -1
    const sortOrder = cfg.get<string>(cfg.KeyEnum.sortOrder);
    this.sortFunction = sortOrder === 'ASC' ? textSortASC : textSortDESC;
  }
  nodeStack: tn.ITreeNode[];
  prevLevel = -1;
  sortLevel = -1;
  sortFunction: (q: tn.ICanSort, w: tn.ICanSort) => number;
  get parent() { return this.nodeStack.at(-1)!; }
  get siblings() { return this.parent.children; }
}

const textSortASC = (q: tn.ICanSort, w: tn.ICanSort): number => q ? q.textSort.localeCompare(w.textSort) : -1;
const textSortDESC = (q: tn.ICanSort, w: tn.ICanSort): number => q ? w.textSort.localeCompare(q.textSort) : -1;
function parseTreeIterator(this: ItrContext, line: string): void {
  const kind = this.nodeStack[0].kind;
  const nextNode = tn.treeNodeFactory(kind);
  nextNode.setLevelAndRawText(line);
  let cntLevelPopped = 0;
  while (nextNode.level <= this.prevLevel && this.sortLevel <= this.prevLevel-- && ++cntLevelPopped) {
    if (isSiblingsAddedComplete()) {
      this.siblings.sort(this.sortFunction);
    }
    this.nodeStack.pop();
  }
  this.siblings.push(nextNode);
  this.nodeStack.push(nextNode);
  nextNode.parentsAndSelf.push(...this.nodeStack);
  nextNode.setDisplayText();
  this.prevLevel = nextNode.level;
  function isSiblingsAddedComplete() {
    return cntLevelPopped > 1;
  }
}
export function parseTreeFromLines(lines: string[], ctxt: ItrContext): void {
  lines.forEach(parseTreeIterator, ctxt);
  const children = ctxt.nodeStack[0].children;
  if (doSortRootChildren()) {
    children.sort(ctxt.sortFunction);
  }
  function doSortRootChildren() {
    return ctxt.sortLevel === -1;
  }
}
export function parseTreeFromText(txt: string, ctxt: ItrContext): void {
  parseTreeFromLines(txt.split('\n'), ctxt);
}
export function printTreeRecur(node: tn.IPrintRecur, rtn: ReturnString = { result: '' }): string {
  if (node.textDisplay) {
    // console.log('' + node);
    rtn.result += node.textDisplay + '\n';
  }
  if (node.children.length) {
    node.children.forEach(q => printTreeRecur(q, rtn));
  }
  return rtn.result;
}
export function printTree(root: tn.IPrintRecur, rtn = ''): string {
  const mainStack = [root];
  let depthFirst, reverseOrder: tn.IPrintRecur | undefined;
  while (mainStack.length) {
    depthFirst = mainStack.pop()!;
    if (depthFirst.textDisplay) {
      rtn += depthFirst.textDisplay + '\n';
      // console.log('' + depthFirst);
    }
    const subStack = [...depthFirst.children];
    while (subStack.length) {
      reverseOrder = subStack.pop()!;
      mainStack.push(reverseOrder);
    }
  }
  return rtn;
}
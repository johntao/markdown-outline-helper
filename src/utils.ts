/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as cfg from "./configs";
import * as tn from "./treeNode";

interface ReturnString {
  result: string
}
export class ItrContext {
  constructor(root: tn.ISortable) {
    this.nodeStack = [root];
    this.sortLevel = cfg.get<number>(cfg.KeyEnum.sortStartLevel) - 1; // -1 based, root start from -1
    const sortOrder = cfg.get<string>(cfg.KeyEnum.sortOrder);
    this.sortFunction = sortOrder === 'ASC' ? textSortASC : textSortDESC;
  }
  nodeStack: tn.ISortable[];
  prevLevel = -1;
  sortLevel = -1;
  sortFunction: (q: tn.ISortable, w: tn.ISortable) => number;
  get parent() { return this.nodeStack.at(-1)!; }
  get siblings() { return this.parent.children; }
}
export function isSortable(siblings: tn.IPrintable[]): siblings is tn.ISortable[] {
  const node = siblings[0];
  return (node as tn.ISortable).textSort !== undefined;
}
const textSortASC = (q: tn.ISortable, w: tn.ISortable): number => q ? q.textSort.localeCompare(w.textSort) : -1;
const textSortDESC = (q: tn.ISortable, w: tn.ISortable): number => q ? w.textSort.localeCompare(q.textSort) : -1;
function parseTreeIterator(this: ItrContext, line: string): void {
  const kind = this.nodeStack[0].kind;
  const nextNode = tn.createTreeNodeFactoryByReadline(kind)(line);
  let cnt = 0;
  while (++cnt && nextNode.level <= this.prevLevel && this.sortLevel <= this.prevLevel--) {
    if (cnt > 1 && isSortable(this.siblings)) {
      this.siblings.sort(this.sortFunction);
    }
    this.nodeStack.pop();
  }
  this.siblings.push(nextNode);
  this.nodeStack.push(nextNode);
  nextNode.setDisplayText(this.nodeStack);
  this.prevLevel = nextNode.level;
}
export function parseTreeFromLines(lines: string[], ctxt: ItrContext): void {
  lines.forEach(parseTreeIterator, ctxt);
  const children = ctxt.nodeStack[0].children;
  if (ctxt.sortLevel === -1 && isSortable(children)) {
    children.sort(ctxt.sortFunction);
  }
}
export function parseTreeFromText(txt: string, ctxt: ItrContext): void {
  parseTreeFromLines(txt.split('\n'), ctxt);
}
export function printTreeRecur(node: tn.IPrintable, rtn: ReturnString = { result: '' }): string {
  if (node.textDisplay) {
    // console.log('' + node);
    rtn.result += node.textDisplay + '\n';
  }
  if (node.children.length) {
    node.children.forEach(q => printTreeRecur(q, rtn));
  }
  return rtn.result;
}
export function printTree(root: tn.IPrintable, rtn = ''): string {
  const mainStack = [root];
  let depthFirst, reverseOrder: tn.IPrintable | undefined;
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
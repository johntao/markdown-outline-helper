/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as tn from "./treeNode";

interface ReturnString {
  result: string
}
export class ItrContext {
  constructor(root: tn.ISortable) {
    this.nodeStack = [root];
  }
  nodeStack: tn.ISortable[];
  prevLevel = -1;
  get parent() { return this.nodeStack.at(-1)!; }
  get siblings() { return this.parent.children; }
}
export function isSortable(siblings: tn.IPrintable[]): siblings is tn.ISortable[] {
  const node = siblings[0];
  return (node as tn.ISortable).textSort !== undefined;
}
export function parseTreeItr(this: ItrContext, line: string): void {
  const kind = this.nodeStack[0].kind;
  const nextNode = tn.createNodeFromTextFactory(kind)(line);
  let cnt = 0;
  while (++cnt && nextNode.level <= this.prevLevel--) {
    if (cnt > 1 && isSortable(this.siblings)) {
      this.siblings.sort((q, w) => q ? q.textSort.localeCompare(w.textSort) : -1);
    }
    this.nodeStack.pop();
  }
  this.siblings.push(nextNode);
  this.nodeStack.push(nextNode);
  nextNode.setDisplayText(this.nodeStack);
  this.prevLevel = nextNode.level;
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
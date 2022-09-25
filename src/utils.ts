/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as tn from "./treeNode";

interface ReturnString {
  result: string
}
export interface ItrContext {
  createNodeFromText(line: string): tn.IParsable;
  nodeStack: tn.IParsable[];
  prevLevel: number;
  get parent(): tn.IParsable;
  get siblings(): tn.IPrintable[]
}
export function isSortable(siblings: tn.IPrintable[]): siblings is tn.ISortable[] {
  const node = siblings[0];
  return (node as tn.ISortable).textSort !== undefined;
}
export function parseTreeItr(this: ItrContext, line: string): void {
  const nextNode = this.createNodeFromText(line);
  let cnt = 0;
  while (++cnt && nextNode.level <= this.prevLevel--) {
    if (cnt > 1 && isSortable(this.siblings)) {
      this.siblings.sort((q, w) => {
        return q ? q.textSort.localeCompare(w.textSort) : -1;
      });
    }
    this.nodeStack.pop();
  }
  this.siblings.push(nextNode);
  this.nodeStack.push(nextNode);
  // nextNode.flatText = this.nodeStack.map(q => q.textSort.split('/').pop()!.trim()).join('/ ').substring(2);
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

// function printFlatTreeRecur(node: TreeNode) {
//   if (!node.isBlockReference) console.log(node.flatText)
//   if (node.children.length)
//     node.children.forEach(q => printFlatTreeRecur(q))
// }
// function printFlatTree(root: TreeNode) {
//   const main = [root]
//   let e1, e2: TreeNode | undefined
//   while (e1 = main.pop()) {
//     if (!e1.isBlockReference) console.log(e1.flatText)
//     while (e2 = e1.children.pop()) main.push(e2)
//   }
//   // const main = [ root ]
//   // while (main.length) {
//   //   const item = main.pop()!
//   //   console.log(item.fullText)
//   //   if (item.children.length)
//   //     main.push(...[...item.children].reverse())
//   // }
// }
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import ITreeNode from "./treeNode";

interface ReturnString {
  result: string
}
export function readTreeRecur(node: ITreeNode, rtn: ReturnString = { result: '' }): string {
  if (node.textDisplay) {
    // console.log('' + node);
    rtn.result += node.textDisplay + '\n';
  }
  if (node.children.length) {
    node.children.forEach(q => readTreeRecur(q, rtn));
  }
  return rtn.result;
}
export function readTree(root: ITreeNode, rtn = ''): string {
  const mainStack = [root];
  let depthFirst, reverseOrder: ITreeNode | undefined;
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
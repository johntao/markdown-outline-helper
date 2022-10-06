/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import * as tn from '../../treeNode';
import * as ut from '../../utils';

suite('Flatten integration test', () => {
  const root: tn.ISortable = new tn.TreeNodePrintFlat();
  const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
  test('integration test', () => {
    const data = `- 100
  - 110
    - 111
  - 120
    - 121
    - 122
  - 130
    - 131
    - 132
    - 133
- 200
  - 210
  - 220
- 300
  - 310
- 400`;
    const expected = `100
100/ 110
100/ 110/ 111
100/ 120
100/ 120/ 121
100/ 120/ 122
100/ 130
100/ 130/ 131
100/ 130/ 132
100/ 130/ 133
200
200/ 210
200/ 220
300
300/ 310
400
`;
    ut.parseTreeFromText(data, itrCtxt);
    const actual = ut.printTree(root);
    assert.strictEqual(actual, expected);
  });
});
suite('Flatten test', () => {
  const root: tn.ISortable = new tn.TreeNodePrintFlat();
  test('Simple', () => {
    const nodeStack = [
      root,
      tn.createTreePrintFlat(0, '100'),
      tn.createTreePrintFlat(1, '110'),
      tn.createTreePrintFlat(2, '111'),
    ];
    exam(nodeStack);
  });
  test('Remove LogSeq hierarchy', () => {
    const nodeStack = [
      root,
      tn.createTreePrintFlat(0, '100'),
      tn.createTreePrintFlat(1, '100/ 110'),
      tn.createTreePrintFlat(2, '100/ 110/ 111'),
    ];
    exam(nodeStack);
  });
  test('Brackets', () => {
    const nodeStack = [
      root,
      tn.createTreePrintFlat(0, '[[100]]'),
      tn.createTreePrintFlat(1, '110'),
      tn.createTreePrintFlat(2, '[[111]]#tag1'),
    ];
    exam(nodeStack);
  });
  test('Block reference', () => {
    const nodeStack = [
      root,
      tn.createTreePrintFlat(0, '[[100]]'),
      tn.createTreePrintFlat(1, '110'),
      tn.createTreePrintFlat(2, '((632b1b15-2250-4041-ba65-a11c852b552c))'),
    ];
    nodeStack[1].setDisplayText(nodeStack.slice(0, 2));
    nodeStack[2].setDisplayText(nodeStack.slice(0, 3));
    nodeStack[3].setDisplayText(nodeStack);
    let tmp = nodeStack[3];
    assert.strictEqual(tmp.textDisplay, '');
    assert.strictEqual(tmp.textSort, '');
    tmp = nodeStack[2];
    assert.strictEqual(tmp.textDisplay, '100/ 110');
    assert.strictEqual(tmp.textSort, '110');
    tmp = nodeStack[1];
    assert.strictEqual(tmp.textDisplay, '100');
    assert.strictEqual(tmp.textSort, '100');
  });
});
function exam(nodeStack: tn.ISortable[]) {
  nodeStack[1].setDisplayText(nodeStack.slice(0, 2));
  nodeStack[2].setDisplayText(nodeStack.slice(0, 3));
  nodeStack[3].setDisplayText(nodeStack);
  let tmp = nodeStack[3];
  assert.strictEqual(tmp.textDisplay, '100/ 110/ 111');
  assert.strictEqual(tmp.textSort, '111');
  tmp = nodeStack[2];
  assert.strictEqual(tmp.textDisplay, '100/ 110');
  assert.strictEqual(tmp.textSort, '110');
  tmp = nodeStack[1];
  assert.strictEqual(tmp.textDisplay, '100');
  assert.strictEqual(tmp.textSort, '100');
}
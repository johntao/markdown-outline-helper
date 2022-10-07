/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import * as tn from '../../treeNode';
import * as ut from '../../iteratorUtils';

suite('Flatten integration test', () => {
  const root: tn.ITreeNode = tn.treeNodeFactory('LogSeqFlatList');
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
  const root: tn.ITreeNode = tn.treeNodeFactory('LogSeqFlatList');
  test('Simple', () => {
    exam(tn.buildNodeStack(root, '100', '110', '111'));
  });
  test('Remove LogSeq hierarchy', () => {
    exam(tn.buildNodeStack(root, '100', '100/ 110', '100/ 110/ 111'));
  });
  test('Brackets', () => {
    exam(tn.buildNodeStack(root, '[[100]]', '110', '[[111]]#tag1'));
  });
  test('Block reference', () => {
    const nodeStack = tn.buildNodeStack(root, '[[100]]', '110', '((632b1b15-2250-4041-ba65-a11c852b552c))');
    let tmp: tn.IPrintLogSeqFlatList;
    tmp = nodeStack[1];
    assert.strictEqual(tmp.textDisplay, '100');
    assert.strictEqual(tmp.textSort, '100');
    tmp = nodeStack[2];
    assert.strictEqual(tmp.textDisplay, '100/ 110');
    assert.strictEqual(tmp.textSort, '110');
    tmp = nodeStack[3];
    assert.strictEqual(tmp.textDisplay, '');
    assert.strictEqual(tmp.textSort, '');
  });
});
function exam(nodeStack: tn.IPrintLogSeqFlatList[]) {
  let tmp: tn.IPrintLogSeqFlatList;
  tmp = nodeStack[1];
  assert.strictEqual(tmp.textDisplay, '100');
  assert.strictEqual(tmp.textSort, '100');
  tmp = nodeStack[2];
  assert.strictEqual(tmp.textDisplay, '100/ 110');
  assert.strictEqual(tmp.textSort, '110');
  tmp = nodeStack[3];
  assert.strictEqual(tmp.textDisplay, '100/ 110/ 111');
  assert.strictEqual(tmp.textSort, '111');
}
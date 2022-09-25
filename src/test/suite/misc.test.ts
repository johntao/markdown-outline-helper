/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import * as tn from '../../treeNode';
import * as utils from '../../utils';
import { ItrContext } from '../../utils';

const INDENT = '  ';
suite.skip('Flatten integration test', () => {
  const root: tn.IParsable = {
    level: -1,
    textDisplay: '',
    textRaw: '',
    setDisplayText: function (nodeStack: tn.IParsable[]): void {
      this.textDisplay = nodeStack.map(q => q.textRaw.trim()).join('/ ').substring(2);
    },
    children: []
  };
  const itrCtxt: ItrContext = {
    nodeStack: [root],
    prevLevel: -1,
    get parent() { return this.nodeStack.at(-1)!; },
    get siblings() { return this.parent.children; },
    createNodeFromText: (line) => {
      const trim = line.trimStart();
      const lvl = (line.length - trim.length) / (INDENT.length);
      const raw = trim.substring(2);
      const rtn: tn.ISortable = {
        ...root,
        textSort: raw
      };
      rtn.children = [];
      rtn.level = lvl;
      rtn.textRaw = raw;
      return rtn;
    }
  };
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
    data.split('\n').forEach(utils.parseTreeItr, itrCtxt);
    const qq = utils.printTree(root);
    assert.strictEqual(qq, expected);
  });
});
suite.skip('Flatten test', () => {
  const root: tn.ISortable = {
    level: -1,
    textDisplay: '',
    textRaw: '',
    textSort: '',
    setDisplayText: function (nodeStack: tn.IParsable[]): void {
      const isBlockReference = this.textRaw.length === 40
        && this.textRaw.startsWith('((')
        && this.textRaw.endsWith('))')
        && this.textRaw[10] === '-'
        && this.textRaw[15] === '-';
      if (isBlockReference) { return; }
      const arr = this.textRaw.split(/\[\[|\]\]/);
      const hasBrackets = arr.length > 2;
      this.textSort = (hasBrackets ? arr[1] : arr[0]).split('/').pop()!.trim();
      if (utils.isSortable(nodeStack)) {
        this.textDisplay = nodeStack.map(q => q.textSort.split('/').pop()!.trim()).join('/ ').substring(2);
      } else {
        this.textDisplay = nodeStack.map(q => q.textRaw.split('/').pop()!.trim()).join('/ ').substring(2);
      }
    },
    children: []
  };
  test('Simple', () => {
    const nodeStack = [
      root,
      { ...root, level: 0, textRaw: '100' },
      { ...root, level: 1, textRaw: '110' },
      { ...root, level: 2, textRaw: '111' },
    ];
    exam(nodeStack);
  });
  test('Remove LogSeq hierarchy', () => {
    const nodeStack = [
      root,
      { ...root, level: 0, textRaw: '100' },
      { ...root, level: 1, textRaw: '100/ 110' },
      { ...root, level: 2, textRaw: '100/ 110/ 111' },
    ];
    exam(nodeStack);
  });
  test('Brackets', () => {
    const nodeStack = [
      root,
      { ...root, level: 0, textRaw: '[[100]]' },
      { ...root, level: 1, textRaw: '110' },
      { ...root, level: 2, textRaw: '[[111]]#tag1' },
    ];
    exam(nodeStack);
  });
  test('Block reference', () => {
    const nodeStack = [
      root,
      { ...root, level: 0, textRaw: '[[100]]' },
      { ...root, level: 1, textRaw: '110' },
      { ...root, level: 2, textRaw: '((632b1b15-2250-4041-ba65-a11c852b552c))' },
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
/*
display text -> hierarchy, flat
storage -> raw, sort, display
remove LogSeq page brackets test -> o(remove): display-flat + sort | x(keep): display-hierarchy
  page bracket also include trailing tags
isBlockReference test -> o(keep): display-hierarchy | x(skip): display-flat, sort
github tests
HierarchyDisplayText
  keep page brackets
  keep trailing tags
  keep BlockReference
FlatDisplayText
  remove page brackets
  remove trailing tags
  skip BlockReference
Sort
  remove page brackets
  remove trailing tags
  skip BlockReference
*/
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
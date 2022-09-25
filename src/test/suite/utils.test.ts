/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as tn from '../../treeNode';
import * as utils from '../../utils';
import { ItrContext } from '../../utils';

suite.skip('Utils print tree', () => {
  vscode.window.showInformationMessage('Start all tests.');
  test.skip('Print tree', () => {
    const root: tn.IPrintable = {
      textDisplay: '',
      children: [
        {
          textDisplay: '- 100', children: [
            {
              textDisplay: '  - 110', children: [
                { textDisplay: '    - 111', children: [] },
              ]
            },
            {
              textDisplay: '  - 120', children: [
                { textDisplay: '    - 121', children: [] },
                { textDisplay: '    - 122', children: [] },
              ]
            },
            {
              textDisplay: '  - 130', children: [
                { textDisplay: '    - 131', children: [] },
                { textDisplay: '    - 132', children: [] },
                { textDisplay: '    - 133', children: [] },
              ]
            },
          ]
        },
        {
          textDisplay: '- 200', children: [
            { textDisplay: '  - 210', children: [] },
            { textDisplay: '  - 220', children: [] },
          ]
        },
        {
          textDisplay: '- 300', children: [
            { textDisplay: '  - 310', children: [] },
          ]
        },
        { textDisplay: '- 400', children: [] },
      ]
    };
    const expected = `- 100
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
- 400
`;
    const qq = utils.printTree(root);
    assert.strictEqual(qq, expected);
    const ww = utils.printTreeRecur(root);
    assert.strictEqual(ww, expected);
  });
});
const INDENT = '  ';
suite('Utils parse tree', () => {
  const root: tn.IParsable = {
    level: -1,
    textDisplay: '',
    textRaw: '',
    setDisplayText: function (nodeStack: tn.IParsable[]): void {
      const node = nodeStack.at(-1)!;
      node.textDisplay = `${INDENT.repeat(node.level)}- ${node.textRaw}`;
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
      // const arr = raw.split(/\[\[|\]\]/);
      // // const hasBrackets = arr.length > 2;
      // // // this.textSort = hasBrackets ? arr[1] : arr[0];
      // // // this.level = lvl;
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
  setup(() => {
    root.level = -1;
    root.children = [];
    itrCtxt.nodeStack = [root];
    itrCtxt.prevLevel = -1;
  });
  test.skip('One level', () => {
    const data = `- 100
- 200
- 300`;
    data.split('\n').forEach(utils.parseTreeItr, itrCtxt);
    const qq = utils.printTree(root);
    assert.strictEqual(qq, data + '\n');
  });
  test.skip('One level sort', () => {
    const data = `- 200
- 300
- 100`;
    const expected = `- 200
- 300
- 100
`;
    data.split('\n').forEach(utils.parseTreeItr, itrCtxt);
    const qq = utils.printTree(root);
    assert.strictEqual(qq, expected);
  });
  test.skip('Two level', () => {
    const data = `- 100
  - 110
  - 120
- 200
  - 210
- 300`;
    data.split('\n').forEach(utils.parseTreeItr, itrCtxt);
    const qq = utils.printTree(root);
    assert.strictEqual(qq, data + '\n');
  });
  test.skip('Two level sort', () => {
    const data = `- 100
  - 130
  - 110
  - 120
- 200
  - 220
  - 210
- 300`;
    const expected = `- 100
  - 110
  - 120
  - 130
- 200
  - 210
  - 220
- 300
`;
    data.split('\n').forEach(utils.parseTreeItr, itrCtxt);
    const qq = utils.printTree(root);
    assert.strictEqual(qq, expected);
  });
  test('Three level', () => {
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
    data.split('\n').forEach(utils.parseTreeItr, itrCtxt);
    const qq = utils.printTree(root);
    assert.strictEqual(qq, data + '\n');
  });
  test('Three level sort', () => {
    const data = `- 100
  - 130
    - 132
    - 131
    - 133
  - 110
    - 111
  - 120
    - 122
    - 121
- 200
  - 220
  - 210
- 300
  - 310
- 400`;
    const expected = `- 100
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
- 400
`;
    data.split('\n').forEach(utils.parseTreeItr, itrCtxt);
    const qq = utils.printTree(root);
    assert.strictEqual(qq, expected);
  });
});

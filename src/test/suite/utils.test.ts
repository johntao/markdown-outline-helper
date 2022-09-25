/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as tn from '../../treeNode';
import * as ut from '../../utils';

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
    const qq = ut.printTree(root);
    assert.strictEqual(qq, expected);
    const ww = ut.printTreeRecur(root);
    assert.strictEqual(ww, expected);
  });
});
suite.skip('Utils parse tree', () => {
  const root: tn.ISortable = new tn.TreeNodePrintHier();
  const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
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
    data.split('\n').forEach(ut.parseTreeItr, itrCtxt);
    const qq = ut.printTree(root);
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
    data.split('\n').forEach(ut.parseTreeItr, itrCtxt);
    const qq = ut.printTree(root);
    assert.strictEqual(qq, expected);
  });
  test.skip('Two level', () => {
    const data = `- 100
  - 110
  - 120
- 200
  - 210
- 300`;
    data.split('\n').forEach(ut.parseTreeItr, itrCtxt);
    const qq = ut.printTree(root);
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
    data.split('\n').forEach(ut.parseTreeItr, itrCtxt);
    const qq = ut.printTree(root);
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
    data.split('\n').forEach(ut.parseTreeItr, itrCtxt);
    const qq = ut.printTree(root);
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
    data.split('\n').forEach(ut.parseTreeItr, itrCtxt);
    const qq = ut.printTree(root);
    assert.strictEqual(qq, expected);
  });
});
suite('Utils sort special cases (print hierarchy)', () => {
  const root: tn.ISortable = new tn.TreeNodePrintHier();
  const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
  setup(() => {
    root.level = -1;
    root.children = [];
    itrCtxt.nodeStack = [root];
    itrCtxt.prevLevel = -1;
  });
  test('Two level sort (brackets and trailing tags)', () => {
    const data = `- 100
  - [[130]]#tag1
  - 110
  - 120
- 200
  - [[200/ 220]]
  - 210
- 300`;
    const expected = `- 100
  - 110
  - 120
  - [[130]]#tag1
- 200
  - 210
  - [[200/ 220]]
- 300
`;
    data.split('\n').forEach(ut.parseTreeItr, itrCtxt);
    const qq = ut.printTree(root);
    assert.strictEqual(qq, expected);
  });
  test('Three level sort', () => {
    const data = `- 100
  - 130
    - ((632b1b15-2250-4041-ba65-a11c852b552c))
    - 133
    - 131
  - 110
    - 111
  - 120
    - 122
    - 121
    - ((632b1b15-2250-4041-ba65-a11c852b552c))
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
    - ((632b1b15-2250-4041-ba65-a11c852b552c))
    - 121
    - 122
  - 130
    - ((632b1b15-2250-4041-ba65-a11c852b552c))
    - 131
    - 133
- 200
  - 210
  - 220
- 300
  - 310
- 400
`;
    data.split('\n').forEach(ut.parseTreeItr, itrCtxt);
    const qq = ut.printTree(root);
    assert.strictEqual(qq, expected);
  });
});
suite.skip('Utils sort special cases (print flat)', () => {
  const root: tn.ISortable = new tn.TreeNodePrintFlat();
  const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
  setup(() => {
    root.level = -1;
    root.children = [];
    itrCtxt.nodeStack = [root];
    itrCtxt.prevLevel = -1;
  });
  test('Two level sort (brackets and trailing tags)', () => {
    const data = `- 100
  - [[130]]#tag1
  - 110
  - 120
- 200
  - [[200/ 220]]
  - 210
- 300`;
    const expected = `100
100/ 110
100/ 120
100/ 130
200
200/ 210
200/ 220
300
`;
    data.split('\n').forEach(ut.parseTreeItr, itrCtxt);
    const qq = ut.printTree(root);
    assert.strictEqual(qq, expected);
  });
  test('Three level sort', () => {
    const data = `- 100
  - 130
    - ((632b1b15-2250-4041-ba65-a11c852b552c))
    - 133
    - 131
  - 110
    - 111
  - 120
    - 122
    - 121
    - ((632b1b15-2250-4041-ba65-a11c852b552c))
- 200
  - 220
  - 210
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
100/ 130/ 133
200
200/ 210
200/ 220
300
300/ 310
400
`;
    data.split('\n').forEach(ut.parseTreeItr, itrCtxt);
    const qq = ut.printTree(root);
    assert.strictEqual(qq, expected);
  });
});

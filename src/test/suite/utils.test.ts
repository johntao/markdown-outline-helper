import * as assert from 'assert';
import * as vscode from 'vscode';
import ITreeNode from '../../treeNode';
import * as utils from '../../utils';

suite('Utils test suite', () => {
  vscode.window.showInformationMessage('Start all tests.');
  const root: ITreeNode = {
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
  const expected =
    `- 100
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
  test('Read tree', () => {
    const qq = utils.readTree(root);
    assert.strictEqual(qq, expected);
    const ww = utils.readTreeRecur(root);
    assert.strictEqual(ww, expected);
  });
});

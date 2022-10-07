/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import * as tn from '../../treeNode';
import * as ut from '../../iteratorUtils';

suite('Github Outline Helper List to Heading', () => {
  const root: tn.ITreeNode = tn.treeNodeFactory('GitHubListToHeading');
  const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
  test('test1', () => {
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
    const expected = `## 1) 100
### &emsp;&emsp;1.1) 110
#### &emsp;&emsp;&emsp;&emsp;1.1.1) 111
### &emsp;&emsp;1.2) 120
#### &emsp;&emsp;&emsp;&emsp;1.2.1) 121
#### &emsp;&emsp;&emsp;&emsp;1.2.2) 122
### &emsp;&emsp;1.3) 130
#### &emsp;&emsp;&emsp;&emsp;1.3.1) 131
#### &emsp;&emsp;&emsp;&emsp;1.3.2) 132
#### &emsp;&emsp;&emsp;&emsp;1.3.3) 133
## 2) 200
### &emsp;&emsp;2.1) 210
### &emsp;&emsp;2.2) 220
## 3) 300
### &emsp;&emsp;3.1) 310
## 4) 400
`;
    ut.parseTreeFromText(data, itrCtxt);
    const actual = ut.printTree(root);
    assert.strictEqual(actual, expected);
  });
});
suite('Github Outline Helper Heading to List', () => {
  const root: tn.ITreeNode = tn.treeNodeFactory('GitHubHeadingToList');
  const itrCtxt: ut.ItrContext = new ut.ItrContext(root);
  test('test1', () => {
    const data = `## 1) 100
### &emsp;&emsp;1.1) 110
#### &emsp;&emsp;&emsp;&emsp;1.1.1) 111
### &emsp;&emsp;1.2) 120
#### &emsp;&emsp;&emsp;&emsp;1.2.1) 121
#### &emsp;&emsp;&emsp;&emsp;1.2.2) 122
### &emsp;&emsp;1.3) 130
#### &emsp;&emsp;&emsp;&emsp;1.3.1) 131
#### &emsp;&emsp;&emsp;&emsp;1.3.2) 132
#### &emsp;&emsp;&emsp;&emsp;1.3.3) 133
## 2) 200
### &emsp;&emsp;2.1) 210
### &emsp;&emsp;2.2) 220
## 3) 300
### &emsp;&emsp;3.1) 310
## 4) 400`;
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
    ut.parseTreeFromText(data, itrCtxt);
    const actual = ut.printTree(root);
    assert.strictEqual(actual, expected);
  });
});
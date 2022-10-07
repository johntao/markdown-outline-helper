import * as cfg from './configs';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export type TreeNodeTypes = 'LogSeqFlatList' | 'LogSeqList' | 'GitHubListToHeading' | 'GitHubHeadingToList';

type PrintFunc = () => void;
type ParseFunc = (line: string) => ICanParse;

export interface ITreeNode extends ICanSort, IPrintRecur, ICanParse, ICanPrint {
  children: ITreeNode[]
  parentsAndSelf: ITreeNode[]
  kind: TreeNodeTypes
  setLevelAndRawText: ParseFunc
  setDisplayText: PrintFunc
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IHasChildren extends IHasChildrenOfT<IHasChildren> {
}
interface IHasChildrenOfT<T> {
  children: T[]
}
export interface IPrintRecur extends IHasChildrenOfT<IPrintRecur> {
  textDisplay: string
}
interface ICanPrint {
  level: number
  textRaw: string
  textDisplay: string
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IPrintGitHubList extends ICanPrint {
}
interface IPrintGitHubHeadings extends ICanPrint {
  parentsAndSelf: IHasChildren[]
}
interface IPrintLogSeqList extends ICanPrint {
  textSort: string
}
export interface IPrintLogSeqFlatList {
  textRaw: string
  textDisplay: string
  textSort: string
  parentsAndSelf: IPrintLogSeqFlatList[]
}
interface ICanParse {
  level: number
  textRaw: string
}
export interface ICanSort {
  textSort: string
}

export function treeNodeFactory(kind: TreeNodeTypes): ITreeNode {
  switch (kind) {
    case 'LogSeqFlatList': return new TreeNode(kind, parseMarkdownList, printLogSeqFlatTree);
    case 'LogSeqList': return new TreeNode(kind, parseMarkdownList, printLogSeqTree);
    case 'GitHubListToHeading': return new TreeNode(kind, parseMarkdownList, printGitHubHeadings);
    case 'GitHubHeadingToList': return new TreeNode(kind, parseGitHubHeadings, printGitHubList);
    default: throw new Error(`Unknown TreeNodeType "${kind}"!`);
  }
}

export function buildNodeStack(root: ITreeNode, ...textRaw: string[]): TreeNode[] {
  const rtn = [ root ];
  textRaw.forEach((txt, idx) => {
    const node = new TreeNode('LogSeqFlatList', parseMarkdownList, printLogSeqFlatTree);
    node.level = idx;
    node.textRaw = txt;
    rtn.push(node);
    node.parentsAndSelf = [...rtn];
    node.setDisplayText();
  });
  return rtn;
}

function parseMarkdownList(this: TreeNode, line: string): ICanParse {
  const trim = line.trimStart();
  const lvl = (line.length - trim.length) / (cfg.get<string>(cfg.KeyEnum.readListIndent).length);
  const raw = trim.substring(2);
  this.level = lvl;
  this.textRaw = raw;
  return this;
}

function parseGitHubHeadings(this: TreeNode, line: string): ICanParse {
  const template = `(#+) (?:${cfg.get<string>(cfg.KeyEnum.headingIndent)})*(?:(?:\\d\\.)*\\d)\\) (.+)`;
  const rex = new RegExp(template, 'g');
  const [, hashs, content] = [...line.matchAll(rex)][0];
  const lvl = hashs.length - 1 - cfg.get<number>(cfg.KeyEnum.headingStartLevel);
  this.level = lvl;
  this.textRaw = content; // format --> "{content}"
  return this;
}

class TreeNode implements ITreeNode {
  textSort = '';
  level = -1;
  constructor(kind: TreeNodeTypes, parseFn: ParseFunc, printFn: PrintFunc) {
    this.kind = kind;
    this.setLevelAndRawText = parseFn.bind(this);
    this.setDisplayText = printFn.bind(this);
  }
  kind: TreeNodeTypes;
  setLevelAndRawText: ParseFunc;
  setDisplayText: PrintFunc;
  textRaw = '';
  textDisplay = '';
  children: ITreeNode[] = [];
  parentsAndSelf: ITreeNode[] = [];
}

function isBlockReference(txt: string) {
  return txt.length === 40
  && txt.startsWith('((')
  && txt.endsWith('))')
  && txt[10] === '-'
  && txt[15] === '-';
}
function parseTextSort(txt: string) {
  const arr = txt.split(/\[\[|\]\]/);
  const hasBrackets = arr.length > 2;
  return stripOffHierarchy(hasBrackets ? arr[1] : arr[0]);
}
function stripOffHierarchy(txt: string) {
  return txt.split('/').pop()!.trim();
}

function printLogSeqTree(this: IPrintLogSeqList): void {
  const isBlockRef = isBlockReference(this.textRaw);
  if (!isBlockRef) {
    this.textSort = parseTextSort(this.textRaw);
  }
  this.textDisplay = `${cfg.get<string>(cfg.KeyEnum.writeListIndent).repeat(this.level)}- ${this.textRaw}`;
}
function printLogSeqFlatTree(this: IPrintLogSeqFlatList): void {
  const isBlockRef = isBlockReference(this.textRaw);
  if (isBlockRef) { return; }
  this.textSort = parseTextSort(this.textRaw);
  const del = cfg.get<string>(cfg.KeyEnum.flatItemDelimiter);
  this.textDisplay = this.parentsAndSelf.map(q => stripOffHierarchy(q.textSort)).join(del).substring(2);
}
function printGitHubHeadings(this: IPrintGitHubHeadings): void {
  const hashs = '#'.repeat(cfg.get<number>(cfg.KeyEnum.headingStartLevel) + this.level + 1);
  const indents = cfg.get<string>(cfg.KeyEnum.headingIndent).repeat(this.level);
  const digits = this.parentsAndSelf.slice(0, -1).map(q => q.children.length).join('.');
  this.textDisplay = `${hashs} ${indents}${digits}) ${this.textRaw}`;
}
function printGitHubList(this: IPrintGitHubList): void {
  this.textDisplay = `${cfg.get<string>(cfg.KeyEnum.writeListIndent).repeat(this.level)}- ${this.textRaw}`;
}
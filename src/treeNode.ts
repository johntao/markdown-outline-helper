import * as cfg from './configs';
import { isSortable } from "./utils";

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export type TreeNodeTypes = 'LogSeqFlatList' | 'LogSeqList' | 'GitHubListToHeading' | 'GitHubHeadingToList';

type PrintFunc = (nodeStack: IParsable[]) => void;
type ParseFunc = (line: string) => ISortable;
export interface IPrintable {
  textDisplay: string
  children: IPrintable[]
}

export interface IParsable extends IPrintable {
  level: number
  setLevelAndRawText: ParseFunc
  setDisplayText: PrintFunc
  textRaw: string
}

export interface ISortable extends IParsable {
  textSort: string
  kind: TreeNodeTypes
}

export function treeNodeFactory(kind: TreeNodeTypes): ISortable {
  switch (kind) {
    case 'LogSeqFlatList': return new TreeNode(kind, parseMarkdownList, printLogSeqFlatTree);
    case 'LogSeqList': return new TreeNode(kind, parseMarkdownList, printLogSeqTree);
    case 'GitHubListToHeading': return new TreeNode(kind, parseMarkdownList, printGitHubHeadings);
    case 'GitHubHeadingToList': return new TreeNode(kind, parseGitHubHeadings, printGitHubList);
    default: throw new Error(`Unknown TreeNodeType "${kind}"!`);
  }
}

export function createTreePrintFlat(lvl: number, txt: string): TreeNode {
  const rtn = new TreeNode('LogSeqFlatList', parseMarkdownList, printLogSeqFlatTree);
  rtn.level = lvl;
  rtn.textRaw = txt;
  return rtn;
}

function parseMarkdownList(this: TreeNode, line: string): ISortable {
  const trim = line.trimStart();
  const lvl = (line.length - trim.length) / (cfg.get<string>(cfg.KeyEnum.readListIndent).length);
  const raw = trim.substring(2);
  this.level = lvl;
  this.textRaw = raw;
  return this;
}

function parseGitHubHeadings(this: TreeNode, line: string): ISortable {
  const template = `(#+) (?:${cfg.get<string>(cfg.KeyEnum.headingIndent)})*(?:(?:\\d\\.)*\\d)\\) (.+)`;
  const rex = new RegExp(template, 'g');
  const [, hashs, content] = [...line.matchAll(rex)][0];
  const lvl = hashs.length - 1 - cfg.get<number>(cfg.KeyEnum.headingStartLevel);
  this.level = lvl;
  this.textRaw = content; // format --> "{content}"
  return this;
}

class TreeNode implements ISortable {
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
  children: IPrintable[] = [];
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

function printLogSeqTree(this: ISortable): void {
  const isBlockRef = isBlockReference(this.textRaw);
  if (!isBlockRef) {
    this.textSort = parseTextSort(this.textRaw);
  }
  this.textDisplay = `${cfg.get<string>(cfg.KeyEnum.writeListIndent).repeat(this.level)}- ${this.textRaw}`;
}
function printLogSeqFlatTree(this: ISortable, nodeStack: IParsable[]): void {
  const isBlockRef = isBlockReference(this.textRaw);
  if (isBlockRef) { return; }
  this.textSort = parseTextSort(this.textRaw);
  const del = cfg.get<string>(cfg.KeyEnum.flatItemDelimiter);
  if (isSortable(nodeStack)) {
    this.textDisplay = nodeStack.map(q => stripOffHierarchy(q.textSort)).join(del).substring(2);
  } else {
    this.textDisplay = nodeStack.map(q => stripOffHierarchy(q.textRaw)).join(del).substring(2);
  }
}
function printGitHubHeadings(this: ISortable, nodeStack: IParsable[]): void {
  const hashs = '#'.repeat(cfg.get<number>(cfg.KeyEnum.headingStartLevel) + this.level + 1);
  const indents = cfg.get<string>(cfg.KeyEnum.headingIndent).repeat(this.level);
  const digits = nodeStack.slice(0, -1).map(q => q.children.length).join('.');
  this.textDisplay = `${hashs} ${indents}${digits}) ${this.textRaw}`;
}
function printGitHubList(this: ISortable): void {
  this.textDisplay = `${cfg.get<string>(cfg.KeyEnum.writeListIndent).repeat(this.level)}- ${this.textRaw}`;
}
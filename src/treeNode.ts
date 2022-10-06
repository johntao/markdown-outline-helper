import * as cfg from './configs';
import { isSortable } from "./utils";

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export interface IPrintable {
  textDisplay: string
  children: IPrintable[]
}

export interface IParsable extends IPrintable {
  level: number
  setDisplayText(nodeStack: IParsable[]): void
  textRaw: string
}

export interface ISortable extends IParsable {
  textSort: string
}

export function parseMarkdownList(this: TreeNodeBase, line: string): ISortable {
  const trim = line.trimStart();
  const lvl = (line.length - trim.length) / (cfg.get<string>(cfg.KeyEnum.readListIndent).length);
  const raw = trim.substring(2);
  this.level = lvl;
  this.textRaw = raw;
  return this;
}

export function parseGitHubHeadings(this: TreeNodeBase, line: string): ISortable {
  const template = `(#+) (?:${cfg.get<string>(cfg.KeyEnum.headingIndent)})*(?:(?:\\d\\.)*\\d)\\) (.+)`;
  const rex = new RegExp(template, 'g');
  const [, hashs, content] = [...line.matchAll(rex)][0];
  const lvl = hashs.length - 1 - cfg.get<number>(cfg.KeyEnum.headingStartLevel);
  this.level = lvl;
  this.textRaw = content; // format --> "{content}"
  return this;
}
export function createTreePrintFlat(lvl: number, txt: string): TreeNodeBase {
  const rtn = new TreeNodeBase(parseMarkdownList, printLogSeqFlatTree);
  rtn.level = lvl;
  rtn.textRaw = txt;
  return rtn;
}

export type PrintFunc = (nodeStack: IParsable[]) => void;
export type ParseFunc = (line: string) => ISortable;

export class TreeNodeBase implements ISortable {
  textSort = '';
  level = -1;
  constructor(parseFn: ParseFunc, printFn: PrintFunc) {
    this.setLevelAndRawText = parseFn.bind(this);
    this.setDisplayText = printFn.bind(this);
  }
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

export function printLogSeqTree(this: ISortable): void {
  const isBlockRef = isBlockReference(this.textRaw);
  if (!isBlockRef) {
    this.textSort = parseTextSort(this.textRaw);
  }
  this.textDisplay = `${cfg.get<string>(cfg.KeyEnum.writeListIndent).repeat(this.level)}- ${this.textRaw}`;
}
export function printLogSeqFlatTree(this: ISortable, nodeStack: IParsable[]): void {
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
export function printGitHubHeadings(this: ISortable, nodeStack: IParsable[]): void {
  const hashs = '#'.repeat(cfg.get<number>(cfg.KeyEnum.headingStartLevel) + this.level + 1);
  const indents = cfg.get<string>(cfg.KeyEnum.headingIndent).repeat(this.level);
  const digits = nodeStack.slice(0, -1).map(q => q.children.length).join('.');
  this.textDisplay = `${hashs} ${indents}${digits}) ${this.textRaw}`;
}
export function printGitHubList(this: ISortable): void {
  this.textDisplay = `${cfg.get<string>(cfg.KeyEnum.writeListIndent).repeat(this.level)}- ${this.textRaw}`;
}
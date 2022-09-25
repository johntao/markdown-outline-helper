import { isSortable } from "./utils";

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const INDENT_IN = '  ';
const INDENT_OUT = '  ';

export type TreeNodeTypes = 'Flat' | 'Hierarchy';

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
  kind: TreeNodeTypes
}

export function createNodeFromTextFactory(type: TreeNodeTypes): (line: string) => ISortable {
  let rtn: ISortable;
  switch (type) {
    case 'Flat': rtn = new TreeFlatPrint(); break;
    case 'Hierarchy': rtn = new TreeHierPrint(); break;
    default: throw new Error('Unknown TreeNodeType');
  }
  return (line: string) => {
    const trim = line.trimStart();
    const lvl = (line.length - trim.length) / (INDENT_IN.length);
    const raw = trim.substring(2);
    rtn.level = lvl;
    rtn.textRaw = raw;
    return rtn;
  };
}
export function createTreeFlatPrint(lvl: number, txt: string): TreeFlatPrint {
  const rtn = new TreeFlatPrint();
  rtn.level = lvl;
  rtn.textRaw = txt;
  return rtn;
}
abstract class TreeNodeBase implements ISortable {
  textSort = '';
  level = -1;
  abstract setDisplayText(nodeStack: IParsable[]): void;
  abstract kind: TreeNodeTypes;
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
export class TreeHierPrint extends TreeNodeBase {
  kind: TreeNodeTypes = 'Hierarchy';
  setDisplayText(): void {
    const isBlockRef = isBlockReference(this.textRaw);
    if (!isBlockRef) {
      this.textSort = parseTextSort(this.textRaw);
    }
    this.textDisplay = `${INDENT_OUT.repeat(this.level)}- ${this.textRaw}`;
  }
}
export class TreeFlatPrint extends TreeNodeBase {
  kind: TreeNodeTypes = 'Flat';
  setDisplayText(nodeStack: IParsable[]): void {
    const isBlockRef = isBlockReference(this.textRaw);
    if (isBlockRef) { return; }
    this.textSort = parseTextSort(this.textRaw);
    if (isSortable(nodeStack)) {
      this.textDisplay = nodeStack.map(q => stripOffHierarchy(q.textSort)).join('/ ').substring(2);
    } else {
      this.textDisplay = nodeStack.map(q => stripOffHierarchy(q.textRaw)).join('/ ').substring(2);
    }
  }
}
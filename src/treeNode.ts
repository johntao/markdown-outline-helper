import * as configs from './configs';
import { isSortable } from "./utils";

/* eslint-disable @typescript-eslint/no-non-null-assertion */

type TreeNodePrintTypes = 'Flat' | 'Hierarchy' | 'ListToHeading' | 'HeadingToList';

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
  kind: TreeNodePrintTypes
}

export function createTreeNodeFactoryByReadline(type: TreeNodePrintTypes): (line: string) => ISortable {
  return (line: string) => {
    let rtn: ISortable;
    switch (type) {
      case 'Flat': rtn = new TreeNodePrintFlat(); break;
      case 'Hierarchy': rtn = new TreeNodePrintHier(); break;
      case 'ListToHeading': rtn = new TreeNodePrintHeading(); break;
      case 'HeadingToList': rtn = new HeadingsPrintHier(); break;
      default: throw new Error('Unknown TreeNodeType');
    }
    switch (type) {
      case 'Flat':
      case 'Hierarchy':
      case 'ListToHeading': {
        const trim = line.trimStart();
        const lvl = (line.length - trim.length) / (configs.get<string>(configs.KeyEnum.readListIndent).length);
        const raw = trim.substring(2);
        rtn.level = lvl;
        rtn.textRaw = raw;
        return rtn;
      }
      case 'HeadingToList': {
        const template = `(#+) (?:${configs.get<string>(configs.KeyEnum.headingIndent)})*(?:(?:\\d\\.)*\\d)\\) (.+)`;
        const rex = new RegExp(template, 'g');
        const [, hashs, content] = [...line.matchAll(rex)][0];
        const lvl = hashs.length - 1 - configs.get<number>(configs.KeyEnum.headingStartLevel);
        rtn.textRaw = content; // format --> "{content}"
        rtn.level = lvl;
        return rtn;
      }
      default: throw new Error('Unknown TreeNodeType');
    }
  };
}
export function createTreePrintFlat(lvl: number, txt: string): TreeNodePrintFlat {
  const rtn = new TreeNodePrintFlat();
  rtn.level = lvl;
  rtn.textRaw = txt;
  return rtn;
}
abstract class TreeNodeBase implements ISortable {
  textSort = '';
  level = -1;
  abstract setDisplayText(nodeStack: IParsable[]): void;
  abstract kind: TreeNodePrintTypes;
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
export class TreeNodePrintHier extends TreeNodeBase {
  kind: TreeNodePrintTypes = 'Hierarchy';
  setDisplayText(): void {
    const isBlockRef = isBlockReference(this.textRaw);
    if (!isBlockRef) {
      this.textSort = parseTextSort(this.textRaw);
    }
    this.textDisplay = `${configs.get<string>(configs.KeyEnum.writeListIndent).repeat(this.level)}- ${this.textRaw}`;
  }
}
export class TreeNodePrintFlat extends TreeNodeBase {
  kind: TreeNodePrintTypes = 'Flat';
  setDisplayText(nodeStack: IParsable[]): void {
    const isBlockRef = isBlockReference(this.textRaw);
    if (isBlockRef) { return; }
    this.textSort = parseTextSort(this.textRaw);
    const del = configs.get<string>(configs.KeyEnum.flatItemDelimiter);
    if (isSortable(nodeStack)) {
      this.textDisplay = nodeStack.map(q => stripOffHierarchy(q.textSort)).join(del).substring(2);
    } else {
      this.textDisplay = nodeStack.map(q => stripOffHierarchy(q.textRaw)).join(del).substring(2);
    }
  }
}
export class TreeNodePrintHeading extends TreeNodeBase {
  kind: TreeNodePrintTypes = 'ListToHeading';
  setDisplayText(nodeStack: IParsable[]): void {
    const hashs = '#'.repeat(configs.get<number>(configs.KeyEnum.headingStartLevel) + this.level + 1);
    const indents = configs.get<string>(configs.KeyEnum.headingIndent).repeat(this.level);
    const digits = nodeStack.slice(0, -1).map(q => q.children.length).join('.');
    this.textDisplay = `${hashs} ${indents}${digits}) ${this.textRaw}`;
  }
}
export class HeadingsPrintHier extends TreeNodeBase {
  kind: TreeNodePrintTypes = 'HeadingToList';
  setDisplayText(): void {
    this.textDisplay = `${configs.get<string>(configs.KeyEnum.writeListIndent).repeat(this.level)}- ${this.textRaw}`;
  }
}
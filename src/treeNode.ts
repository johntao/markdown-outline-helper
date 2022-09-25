const INDENT_IN = '\t';
const INDENT_OUT = '  ';

export interface IPrintable {
  textDisplay: string
  children: IPrintable[]
  // level?: number
  // setDisplayText?(nodeStack: ITreeNodeA[]): void
}
export interface IParsable extends IPrintable {
  // textDisplay: string
  // children: ITreeNodeB[]
  level: number
  setDisplayText(nodeStack: IParsable[]): void
  textRaw: string
}

export interface ISortable extends IParsable {
  textSort: string
}
// export class TreeNode implements ITreeNodeA {
//   constructor(txt: string) { // txt format --> "{indent}- {content}"
//     if (!txt) { return; }
//     const trim = txt.trimStart();
//     const lvl = (txt.length - trim.length) / (INDENT_IN.length);
//     this.textRaw = trim.substring(2);
//     this.isBlockReference = this.textRaw.length === 40
//       && this.textRaw.startsWith('((')
//       && this.textRaw.endsWith('))')
//       && this.textRaw[10] === '-'
//       && this.textRaw[15] === '-';
//     const arr = this.textRaw.split(/\[\[|\]\]/);
//     const hasBrackets = arr.length > 2;
//     this.textSort = hasBrackets ? arr[1] : arr[0];
//     this.level = lvl;
//     this.textDisplay = `${INDENT_OUT.repeat(this.level)}- ${this.textRaw}`;
//   }
//   // setDisplayText(nodeStack: ITreeNodeA[]): void {
//   //   throw new Error("Method not implemented.");
//   // }
//   flatText?: string; // depends on nodeStack, unavailable until nodeStack is set, strip off hierarchies
//   textRaw = '';
//   textDisplay = '';
//   textSort = ''; // strip off LogSeq tokens
//   isBlockReference = false;
//   level = -1;
//   children: ITreeNodeA[] = [];
// }
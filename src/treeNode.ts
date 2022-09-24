const INDENT_IN = '\t';
const INDENT_OUT = '  ';

export default interface ITreeNode {
  textDisplay: string
  // level: number
  children: ITreeNode[]
}
export class TreeNode implements ITreeNode {
  constructor(txt: string) { // txt format --> "{indent}- {content}"
    if (!txt) { return; }
    const trim = txt.trimStart();
    const lvl = (txt.length - trim.length) / (INDENT_IN.length);
    this.textRaw = trim.substring(2);
    this.isBlockReference = this.textRaw.length === 40
      && this.textRaw.startsWith('((')
      && this.textRaw.endsWith('))')
      && this.textRaw[10] === '-'
      && this.textRaw[15] === '-';
    const arr = this.textRaw.split(/\[\[|\]\]/);
    const hasBrackets = arr.length > 2;
    this.textSort = hasBrackets ? arr[1] : arr[0];
    this.level = lvl;
    this.textDisplay = `${INDENT_OUT.repeat(this.level)}- ${this.textRaw}`;
  }
  flatText?: string; // depends on nodeStack, unavailable until nodeStack is set, strip off hierarchies
  textRaw = '';
  textDisplay = '';
  textSort = ''; // strip off LogSeq tokens
  isBlockReference = false;
  level = -1;
  children: TreeNode[] = [];
}
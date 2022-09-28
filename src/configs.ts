/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as vscode from 'vscode';

let configs: vscode.WorkspaceConfiguration;
export function refreshConfiguration() {
  configs = vscode.workspace.getConfiguration('markdown-outline-helper');
}

export enum KeyEnum {
  readListIndent,
  writeListIndent,
  headingStartLevel,
  headingIndent,
  flatItemDelimiter,
  sortStartLevel,
}

export function get<T>(key: number): T {
  return configs.get<T>(KeyEnum[key])!;
}
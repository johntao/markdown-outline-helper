/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as vscode from 'vscode';

let configs: vscode.WorkspaceConfiguration;
export function refreshConfiguration() {
  configs = vscode.workspace.getConfiguration('markdown-outline-helper');
}

export type KeyEnum =
  | ''
  | 'convertHeadingsToList.writeIndent'
  | 'convertHeadingsToList.headingStartLevel'
  | 'convertHeadingsToList.headingIndent'
  | 'convertListToHeadings.readIndent'
  | 'convertListToHeadings.headingStartLevel'
  | 'convertListToHeadings.headingIndent'
  | 'sortList.readIndent'
  | 'sortList.writeIndent'
  | 'sortAndFlattenList.readIndent'
  | 'sortAndFlattenList.delimiter';

// type StringOrNumber = string | number;

export function get<T>(key: KeyEnum): T {
  const useGlobal = configs.get<boolean>('useGlobal');
  switch (key) {
    case 'sortAndFlattenList.delimiter':
      return configs.get<T>(key)!;
    default:
      return useGlobal ?
        configs.get<T>(`global.${key.split('.')[1]}`)! : 
        configs.get<T>(key)!;
  }
}
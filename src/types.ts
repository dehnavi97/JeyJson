export type TabMode = 
  | 'editor' 
  | 'diff' 
  | 'converter' 
  | 'to-code' 
  | 'http';

export type FontFamily = 'jetbrains' | 'firacode' | 'inter' | 'source';

export type AppTheme = 'dark' | 'light';

export interface AppSettings {
  fontId: FontFamily;
  theme: AppTheme;
}

export interface AppTab {
  id: string;
  name: string;
  content: string;
  mode: TabMode;
  filePath: string | null;
  isDirty: boolean;
  diffLeftTabId?: string;
  diffRightTabId?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  content: string;
  snippetPreview: string;
}

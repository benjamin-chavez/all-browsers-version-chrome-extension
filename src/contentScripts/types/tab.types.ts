// src/interfaces/tab.types.ts
import browser from 'webextension-polyfill';

export type TabId = browser.Tabs.Tab['id'] | number;
export type ValidTabId = Exclude<TabId, undefined>;
export type JSONString = string;

interface Tab {
  tabId: TabId;
  active?: boolean;
  currentIndex: number;
  matchesCount: number | undefined;
  globalMatchIdxStart?: number;
}

export interface XPathMatchObject {
  text: string;
  xpath: string;
  spanClasses: string[];
}

export interface XPathTabState extends Tab {
  queryMatches: XPathMatchObject[];
}

export interface TabState extends Tab {
  queryMatches: HTMLSpanElement[];
}
export interface BasicTabState {
  tabId: ValidTabId;
  serializedTabState: SerializedTabState;
}
export interface SerializedTabState extends Tab {
  serializedMatches: JSONString;
}

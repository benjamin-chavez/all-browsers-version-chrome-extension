// src/background/utils/chromeApiUtils.ts

import browser from 'webextension-polyfill';
import { TabId, ValidTabId } from '../../contentScripts/types/tab.types';
// import { getAllStoredTabs } from './storage';
import InstallDetails from '../store/installDetails';
import ctrlLogger from '../../shared/utils/ctrlLogger';
import { getAllStoredTabs } from './storage';

/**
 * Chrome Api: Window Utils
 */
export async function getAllOpenWindows(): Promise<browser.Windows.Window[]> {
  try {
    const windows = await browser.windows.getAll({ populate: true });
    return windows;
  } catch (error) {
    throw error;
  }
}

export async function getLastFocusedWindow(): Promise<browser.Windows.Window> {
  try {
    const window = await browser.windows.getLastFocused();
    return window;
  } catch (error) {
    throw error;
  }
}

/**
 * Chrome Api: Tab Utils
 */
export function toValidTabId(tabId: TabId): ValidTabId {
  if (tabId === undefined) {
    throw new Error('TabId cannot be undefined');
  }
  return tabId as ValidTabId;
}

export async function getActiveTabId(): Promise<number> {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs[0]?.id) {
      return tabs[0].id;
    } else {
      throw new Error('No active Tab');
    }
  } catch (error) {
    throw error;
  }
}

// TODO: REVIEW/RENAME TO FIT WITH THE OTHERS?
export async function queryCurrentWindowTabs(
  activeTab: boolean | undefined = undefined
): Promise<browser.Tabs.Tab[]> {
  // return new Promise((resolve) => {
  //   browser.tabs.query({ active: activeTab, currentWindow: true }, resolve);
  // });
  try {
    const currentWindowTabs = await browser.tabs.query({
      active: activeTab,
      currentWindow: true,
    });
    return currentWindowTabs;
  } catch (error) {
    throw error;
  }
}

export async function getOrderedTabs(
  includeActiveTab = true
): Promise<browser.Tabs.Tab[]> {
  const tabs = await queryCurrentWindowTabs(); // FIXME: this should probably use store.activeWindowStore

  // tabs = tabs.sort((a, b) => a.index - b.index);

  const activeTabIndex = tabs.findIndex((tab) => tab.active);
  const startSliceIdx = includeActiveTab ? activeTabIndex : activeTabIndex + 1;

  const orderedTabs = [
    ...tabs.slice(startSliceIdx),
    ...tabs.slice(0, activeTabIndex),
  ];

  return orderedTabs;
}

// FIXME:  The storedTabs and the filter are both required otherwise the tabs won't cycle back to the beginning
export async function getOrderedTabIds(): Promise<ValidTabId[]> {
  const orderedTabs = await getOrderedTabs();
  const storedTabs = await getAllStoredTabs();
  const tabIds = Object.keys(storedTabs).map((key) => parseInt(key, 10));

  // const orderedTabIds: ValidTabId[] = orderedTabs
  //   .map((tab) => tab.id)
  //   .filter((id): id is ValidTabId => id !== undefined && tabIds.includes(id));

  const orderedTabIds: ValidTabId[] = orderedTabs
    .map((tab) => toValidTabId(tab.id))
    .filter((id) => tabIds.includes(id));

  return orderedTabIds;
}

export async function queryAllTabIds(): Promise<ValidTabId[]> {
  const tabs = await browser.tabs.query({});

  return tabs
    .map((tab) => tab.id)
    .filter((id): id is number => id !== undefined);
}

export async function executeContentScripts() {
  const tabIds = await queryAllTabIds();

  tabIds.forEach(async (tabId) => {
    try {
      await browser.scripting.executeScript({
        target: { tabId },
        files: ['layover.js', 'highlightStyles.js'],
      });
    } catch (error) {
      ctrlLogger.warn(`Caught `, error);
    }
  });
}

export async function checkOnInstalled() {
  setTimeout(async () => {
    if (InstallDetails != null) {
      await executeContentScripts();
      InstallDetails.reason = null;
    }
  }, 100);
}

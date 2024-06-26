// src/background/store/databaseStore.ts

import browser from 'webextension-polyfill';
import {
  getAllOpenWindows,
  getLastFocusedWindow,
} from '../utils/chromeApiUtils';
import { WindowStore, createWindowStore } from './windowStore';

type DatabaseStore = {
  lastFocusedWindowId: browser.Windows.Window['id'];
  windowStores: { [K in number]: WindowStore };
  activeWindowStore: WindowStore;

  init: () => Promise<void>;
  setLastFocusedWindowId: (
    lastFocusedWindowId: browser.Windows.Window['id']
  ) => void;
};

const databaseStore: DatabaseStore = {
  lastFocusedWindowId: -1,
  windowStores: {},
  activeWindowStore: createWindowStore(),

  async init() {
    const windows = await getAllOpenWindows();

    windows.forEach((window) => {
      if (window.id !== undefined) {
        this.windowStores[window.id] = createWindowStore();
      }
    });

    const lastFocusedWindow = await getLastFocusedWindow();
    this.setLastFocusedWindowId(lastFocusedWindow.id);
  },

  setLastFocusedWindowId(lastFocusedWindowId) {
    if (lastFocusedWindowId === undefined) {
      throw new Error('No active window');
    }

    this.lastFocusedWindowId = lastFocusedWindowId;
    this.activeWindowStore = this.windowStores[this.lastFocusedWindowId];
  },
};

export default databaseStore;

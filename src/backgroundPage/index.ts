// src/background/index.ts

import browser from 'webextension-polyfill';

browser.runtime.onMessage.addListener((request: { popupMounted: boolean }) => {
  if (request.popupMounted) {
    console.log('background page notified that Popup.tsx has mounted');
  }
});

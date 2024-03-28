// src/background/utils/sendMessageToContent.ts

import browser from 'webextension-polyfill';
import { ToLayoverMessage } from '../types/message.types';

export default async function sendMessageToTab<T extends ToLayoverMessage>(
  tabId: number,
  message: T
): Promise<any> {
  if (message.async) {
    try {
      const res = await browser.tabs.sendMessage(tabId as number, message);
      console.log('🚀 ~ res:', JSON.stringify(res, null, 2));
      return res;
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    return new Promise<void>((resolve, reject) => {
      try {
        return browser.tabs
          .sendMessage(tabId as number, message)
          .then(() => resolve())
          .catch(reject);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }
}

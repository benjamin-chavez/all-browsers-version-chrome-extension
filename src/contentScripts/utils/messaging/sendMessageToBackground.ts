// src/utils/messageUtils/sendMessageToBackground.ts

import browser from 'webextension-polyfill';
import { ToBackgroundMessage } from '../../types/toBackgroundMessage.types';

const sendMessageToBackground = <T extends ToBackgroundMessage>(
  message: T
): Promise<any> => {
  console.log('message', JSON.stringify(message, null, 2));
  return browser.runtime.sendMessage(message);
};

export default sendMessageToBackground;

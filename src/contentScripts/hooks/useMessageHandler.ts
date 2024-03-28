// src/contentScripts/hooks/useMessageHandler.ts

import browser from 'webextension-polyfill';
import { useEffect } from 'react';
import { ToLayoverMessage } from '../../background/types/message.types';
import { ResponseCallback } from '../../shared/types/shared.types';

type MessageHandler = (
  message: ToLayoverMessage,
  sender: browser.Runtime.MessageSender,
  sendResponse: ResponseCallback
) => Promise<boolean | undefined>;

export default function useMessageHandler(messageHandler: MessageHandler) {
  useEffect(() => {
    browser.runtime.onMessage.addListener(messageHandler);

    return () => {
      browser.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]);
}

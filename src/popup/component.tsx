// src/popup/component.tsx

import React from 'react';
import { useEffect } from 'react';
import browser from 'webextension-polyfill';

export function Popup() {
  useEffect(() => {
    browser.runtime.sendMessage({ popupMounted: true });
  }, []);

  return (
    <div>
      <p>hello!!!</p>
    </div>
  );
}

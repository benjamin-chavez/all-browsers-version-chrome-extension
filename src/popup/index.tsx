// src/popup/index.ts
import browser from 'webextension-polyfill';
import { Popup } from './component';
import ReactDOM from 'react-dom';
import React from 'react';

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  ReactDOM.render(<Popup />, document.getElementById('popup'));
});

// src/utils/storage.ts

import browser from 'webextension-polyfill';
import { LayoverPosition } from '../../shared/types/shared.types';
import { SerializedTabState } from '../../contentScripts/types/tab.types';

export interface Match {
  innerText: string;
  className: string;
  id: string;
}

// FIXME: review for duplicates
interface LocalStorage {
  searchValue?: string;
  lastSearchValue?: string;
  allMatches?: Match[];
  tabs?: { [tabId: number]: SerializedTabState };
  layoverPosition?: LayoverPosition;
}

type LocalStorageKeys = keyof LocalStorage;

async function getLocalStorageItem<T extends LocalStorageKeys>(
  key: T
): Promise<LocalStorage[T]> {
  const storage = await browser.storage.local.get(key);
  return storage[key];
}

async function setLocalStorageItem<T extends LocalStorageKeys>(
  key: T,
  value: LocalStorage[T]
): Promise<void> {
  await browser.storage.local.set({ [key]: value });
}

export async function getAllStoredTabs(): Promise<{
  [tabId: number]: SerializedTabState;
}> {
  const tabs = await getLocalStorageItem('tabs');
  return tabs ?? {};
}

export async function setStoredTabs(
  serializedState: SerializedTabState
): Promise<void> {
  const key: LocalStorageKeys = 'tabs';
  const { tabId, serializedMatches, matchesCount } = serializedState;
  console.log('🚀 ~ tabId:', tabId);
  console.log('🚀 ~ serializedMatches:', serializedMatches);
  console.log('matchesCount', matchesCount);

  // if (!tabId || !serializedMatches || !matchesCount) {
  if (
    tabId === undefined ||
    serializedMatches === undefined ||
    matchesCount === undefined
  ) {
    throw new Error('Invalid tab storage object');
  }

  const currentData = await getLocalStorageItem(key);
  const updatedData = { ...currentData, [tabId]: serializedState };
  return setLocalStorageItem(key, updatedData);
}

export async function clearLocalStorage() {
  await browser.storage.local.clear();
}

export function clearAllStoredTabs(): Promise<void> {
  const key: LocalStorageKeys = 'tabs';

  return setLocalStorageItem(key, {});
}

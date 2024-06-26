/* eslint-disable import/prefer-default-export */
// src/background/messageHandlers/handleGetAllMatches.ts

import browser from 'webextension-polyfill';
import { ValidTabId } from '../../contentScripts/types/tab.types';
import store from '../store/databaseStore';
import { HIGHLIGHT, HighlightMsg } from '../types/message.types';
import { getOrderedTabs, toValidTabId } from '../utils/chromeApiUtils';
import sendMessageToTab from '../utils/sendMessageToContent';
import { setStoredTabs } from '../utils/storage';

// async function findMatchesOnTab(
//   tabId: ValidTabId,
//   foundFirstMatch: boolean
// ): Promise<{
//   hasMatch: boolean;
//   serializedState: SerializedTabState;
// }> {
//   const { activeWindowStore } = store;
//   const response = await sendMessageToTab<HighlightMsg>(tabId, {
//     async: true,
//     from: 'background',
//     type: 'highlight',
//     payload: {
//       findValue: activeWindowStore.searchValue,
//       foundFirstMatch,
//       tabId,
//     },
//   });
//   return response;
// }

// // FIXME: might make sense to refactor the loop to get all matches and then update the start indexes after
// export default async function handleGetAllMatches(
//   searchValue: string
// ): Promise<boolean> {
//   const { activeWindowStore } = store;
//   activeWindowStore.resetPartialStore();
//   activeWindowStore.update({
//     searchValue,
//     lastSearchValue: searchValue,
//   });

//   if (searchValue === '') {
//     sendStoreToContentScripts(activeWindowStore);
//     return false;
//   }

//   const orderedTabs = await getOrderedTabs();
//   let foundFirstMatch = false;

//   /* eslint-disable no-await-in-loop */
//   for (let i = 0; i < orderedTabs.length; i += 1) {
//     const tab = orderedTabs[i];
//     const tabId: ValidTabId = tab.id as number;

//     const { hasMatch, serializedState } = await findMatchesOnTab(
//       tabId,
//       foundFirstMatch
//     );

//     if (!hasMatch) {
//       continue;
//     }

//     await setStoredTabs(serializedState);

//     serializedState.globalMatchIdxStart = activeWindowStore.totalMatchesCount;

//     activeWindowStore.updateTotalMatchesCount(
//       activeWindowStore.totalMatchesCount + serializedState.matchesCount
//     );

//     activeWindowStore.update({
//       tabStores: {
//         ...activeWindowStore.tabStores,
//         [tabId]: {
//           tabId,
//           serializedTabState: serializedState,
//         },
//       },
//     });

//     if (foundFirstMatch) {
//       continue;
//     }

//     foundFirstMatch = true;
//     const activeTab = orderedTabs[0];
//     if (activeTab.id !== tabId) {
//       chrome.tabs.update(tabId, { active: true });
//     }
//   }
//   /* eslint-enable no-await-in-loop */

//   sendStoreToContentScripts(activeWindowStore);
//   return true;
// }

async function findMatchesOnTab(
  tab: browser.Tabs.Tab,
  foundFirstMatch: boolean
): Promise<{
  hasMatch: boolean;
  state: any;
}> {
  try {
    const { activeWindowStore } = store;
    const tabId: ValidTabId = toValidTabId(tab.id);

    const response = await sendMessageToTab<HighlightMsg>(tabId, {
      async: true,
      type: HIGHLIGHT,
      payload: {
        tabId,
        searchValue: activeWindowStore.searchValue,
        foundFirstMatch,
      },
    });

    const { currentIndex, matchesCount, serializedMatches } =
      response.serializedState;

    await setStoredTabs(response.serializedState);

    const globalMatchIdxStart = activeWindowStore.totalMatchesCount;

    activeWindowStore.updateTotalMatchesCount(
      activeWindowStore.totalMatchesCount + matchesCount
    );

    activeWindowStore.update({
      tabStores: {
        ...activeWindowStore.tabStores,
        [tabId]: {
          tabId,
          serializedTabState: {
            tabId,
            currentIndex,
            matchesCount,
            serializedMatches,
            globalMatchIdxStart,
          },
        },
      },
    });

    return response;
  } catch (error) {
    return { hasMatch: false, state: null };
  }
}

/* eslint-disable no-await-in-loop */ // FIXME: might make sense to refactor the loop to get all matches and then update the start indexes after
export default async function handleGetAllMatches() {
  const orderedTabs = await getOrderedTabs();
  let foundFirstMatch = false;

  // Process tabs one by one until the first match
  for (let i = 0; i < orderedTabs.length; i += 1) {
    const tab = orderedTabs[i];

    if (tab.id) {
      const validTabId: ValidTabId = toValidTabId(tab.id);

      const { hasMatch } = await findMatchesOnTab(tab, foundFirstMatch);

      if (hasMatch && !foundFirstMatch) {
        foundFirstMatch = true;

        const activeTab = orderedTabs[0];
        if (activeTab.id !== validTabId) {
          browser.tabs.update(validTabId, { active: true });
        }
      }
    }
  }
  /* eslint-enable no-await-in-loop */
}

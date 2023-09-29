// background.js
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.setOptions({tabId: tab.id, enabled: true});
  });

// Allow users to open the sidebar by clicking on the action toolbar icon
chrome.sidePanel
.setPanelBehavior({ openPanelOnActionClick: true })
.catch((error) => console.error(error));
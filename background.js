// background.js
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.setOptions({tabId: tab.id, enabled: true});
  });

// Open the sidebar on clicking on the action toolbar icon
chrome.sidePanel
.setPanelBehavior({ openPanelOnActionClick: true })
.catch((error) => console.error(error));
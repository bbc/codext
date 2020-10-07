"use strict";

const tabIdToContentType = {};

// Populate the extension's context menu with relevant items. Right-click on the
// page action icon to open it.
chrome.storage.local.get(["disabled", "theme"], function (state) {
  const theme = state["theme"];

  addNormalMenu(getDisabledStateLabel(state["disabled"]), "disabled");
  addMenuSeparator("separator1");
  addRadioMenu("Light Theme", "vs", theme === "vs");
  addRadioMenu("Dark Theme", "vs-dark", theme === "vs-dark");
  addRadioMenu("High Contrast Theme", "hc-black", theme === "hc-black");
  addMenuSeparator("separator2");
  addNormalMenu("Homepage", "homepage");
  addNormalMenu("License", "license");
  addMenuSeparator("separator3");
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (typeof sender !== "undefined") {
    if (request.action === "show_page_action") {
      chrome.pageAction.show(sender.tab.id);
    } else if (request.action === "get_content_type") {
      sendResponse({
        contentType: tabIdToContentType[sender.tab.id],
      });
    } else if (request.action === "download_content") {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        function (tabs) {
          // Encode contents and prepare for local download.
          const blob = new Blob([request.content], { type: "text/plain" });
          const downloadUrl = URL.createObjectURL(blob);
          const tabUrl = tabs[0].url;
          chrome.downloads.download({
            url: downloadUrl,
            filename: tabUrl.substr(tabUrl.lastIndexOf("/") + 1),
          });
        }
      );
    }
  }
});

// Store the content-types headers, which will help us select the editor's
// language. Note: this feature requires a persistent background in
// manifest.json until declarativeWebRequest goes stable or support for event
// pages is added to webRequest.
chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    for (const header of details.responseHeaders) {
      if (header.name.toLowerCase() === "content-type") {
        tabIdToContentType[details.tabId] = header.value;
        return;
      }
    }
  },
  {
    urls: ["<all_urls>"],
    types: ["main_frame"],
  },
  ["responseHeaders"]
);

chrome.contextMenus.onClicked.addListener(function (event) {
  if (event.menuItemId === "homepage") {
    window.open("https://github.com/bbc/Codext");
  } else if (event.menuItemId === "license") {
    window.open("https://github.com/bbc/Codext/blob/master/LICENSE");
  } else if (event.menuItemId === "disabled") {
    chrome.storage.local.get("disabled", function (state) {
      const newState = state["disabled"] === "true" ? "false" : "true";
      // Persist new state and update action label in context menu.
      chrome.storage.local.set({
        disabled: newState,
      });
      chrome.contextMenus.update("disabled", {
        title: getDisabledStateLabel(newState),
      });
    });
  }
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "update") {
    chrome.notifications.create("update_notification", {
      title: "Extension update",
      message: `Codext updated to version ${chrome.runtime.getManifest().version}`,
      type: "basic",
      iconUrl: "images/codext_logo.png",
    });
  }
});

function selectTheme(info, tab) {
  chrome.storage.local.set({
    theme: info.menuItemId,
  });
  chrome.tabs.sendMessage(tab.id, { action: "set_theme", content: info.menuItemId });
}

function addNormalMenu(menuTitle, menuId) {
  chrome.contextMenus.create({
    title: menuTitle,
    id: menuId,
    contexts: ["page_action"],
  });
}

function addRadioMenu(menuTitle, menuId, checked) {
  chrome.contextMenus.create({
    title: menuTitle,
    type: "radio",
    checked: checked,
    id: menuId,
    contexts: ["page_action"],
    onclick: selectTheme,
  });
}

function addMenuSeparator(separatorId) {
  chrome.contextMenus.create({
    type: "separator",
    id: separatorId,
    contexts: ["page_action"],
  });
}

function getDisabledStateLabel(state) {
  return `${state === "true" ? "Enable" : "Disable"} extension`;
}

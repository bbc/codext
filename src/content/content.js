"use strict";

if (shouldLaunchEditor(document.body)) {
    const element = document.body.getElementsByTagName("pre")[0];
    prepareEditorLaunch(element);
}

function prepareEditorLaunch(element) {
    // Hide contents to avoid flickering while the rest of the script loads
    // asynchronously.
    element.style.setProperty("display", "none", "");
    chrome.storage.local.get("disabled", function(state) {
        if (state["disabled"] === "true") {
            element.style.removeProperty("display");
        } else {
            listenToEditorMessages(element);
            insertEditorFrame();
        }
    });
    // Notify the background to show the page action for the current tab.
    chrome.runtime.sendMessage({
        action: "show_page_action"
    });
}

function shouldLaunchEditor(body) {
    // Only handle documents with a unique <pre> element.
    return body && body.getElementsByTagName("pre").length === 1 && body.childNodes.length === 1;
}

function listenToEditorMessages(element) {
    window.addEventListener("message", function(message) {
        // Wait for editor frame to signal that it has loaded.
        if (message.data === "loaded") {
            element.parentNode.removeChild(element);
            const response = {
                code: element.textContent,
                extension: location.href.substr(location.href.lastIndexOf("."))
            };
            message.source.postMessage(response, chrome.runtime.getURL(""));
        }
    });
}

function insertEditorFrame() {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", chrome.runtime.getURL("editor/editor.html"));
    iframe.setAttribute("style", "border: 0px none; width: 100%; height: 100%;");

    document.body.style.margin = "0px";
    document.body.insertBefore(iframe, document.body.firstChild);
}

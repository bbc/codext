"use strict";

describe("Background script", function() {

    beforeEach(function() {
        chrome.notifications.create.flush();
        chrome.contextMenus.update.flush();
        chrome.storage.local.set.flush();
        chrome.pageAction.show.flush();
        chrome.downloads.download.flush();
    });

    it("should show page action when message received", function() {
        chrome.runtime.onMessage.dispatch({
            action: "show_page_action"
        }, {
            tab: {
                id: 1
            }
        }, null);

        expect(chrome.pageAction.show.withArgs(1).calledOnce).toBeTruthy();
    });

    it("should send the tab's content type when message received", function() {
        tabIdToContentType[2] = "application/json";

        const sendResponse = jasmine.createSpy("send-response");
        chrome.runtime.onMessage.dispatch({
            action: "get_content_type"
        }, {
            tab: {
                id: 2
            }
        }, sendResponse);

        expect(sendResponse).toHaveBeenCalledWith({
            contentType: "application/json"
        });
    });

    it("should download the messages's contents", function() {
        chrome.tabs.query.withArgs({
            active: true,
            currentWindow: true
        }).yields([ {
            id: 3,
            url: "https://my-url/some-file.txt"
        } ]);

        chrome.runtime.onMessage.dispatch({
            action: "download_content",
            content: "my-content"
        }, {
            tab: {
                id: 3
            }
        });

        expect(chrome.downloads.download.firstCall.args[0].filename).toEqual("some-file.txt");
    });

    it("should save content type when headers are received", function() {
        chrome.webRequest.onHeadersReceived.dispatch({
            responseHeaders: [ {
                name: "Content-Type",
                value: "application/javascript"
            } ],
            tabId: 4
        });

        expect(tabIdToContentType[4]).toEqual("application/javascript");
    });

    it("should persist state and update context menu when disabled is toggled", function() {
        chrome.storage.local.get.withArgs("disabled").yields({
            disabled: "false"
        });

        chrome.contextMenus.onClicked.dispatch({
            menuItemId: "disabled"
        });

        expect(chrome.storage.local.set.withArgs({
            disabled: "true"
        }).calledOnce).toBeTruthy();
        expect(chrome.contextMenus.update.withArgs("disabled", {
            title: "Enable extension"
        }).calledOnce).toBeTruthy();
    });

    it("should notify about update", function() {
        chrome.runtime.getManifest.returns({
            version: "1.0.0"
        });

        chrome.runtime.onInstalled.dispatch({
            reason: "update"
        });

        expect(chrome.notifications.create.withArgs("update_notification", {
            title: "Extension update",
            message: "Extension updated to version 1.0.0",
            type: "basic",
            iconUrl: "images/codext_logo.png"
        }).calledOnce).toBeTruthy();
    });

    it("should not notify for other install triggers", function() {
        chrome.runtime.onInstalled.dispatch({
            reason: "install"
        });

        expect(chrome.notifications.create.notCalled).toBeTruthy();
    });

    it("should add an item to the context menu", function() {
        addNormalMenu("title", "id");

        expect(chrome.contextMenus.create.withArgs({
            title: "title",
            id: "id",
            contexts: [ "page_action" ]
        }).calledOnce).toBeTruthy();
    });

    it("should add a separator to the context menu", function() {
        addMenuSeparator("separator1");

        expect(chrome.contextMenus.create.withArgs({
            type: "separator",
            id: "separator1",
            contexts: [ "page_action" ]
        }).calledOnce).toBeTruthy();
    });
});

"use strict";

describe("Content script", function() {
  beforeEach(function() {
    chrome.runtime.sendMessage.flush();
  });

  it("should return true if document has a single pre element", function() {
    const body = document.createElement("body");
    const pre = document.createElement("pre");
    body.appendChild(pre);

    expect(shouldLaunchEditor(body)).toBeTruthy();
  });

  it("should return false if other elements in the page", function() {
    const body = document.createElement("body");
    const pre = document.createElement("pre");
    body.appendChild(pre);
    const div = document.createElement("div");
    body.appendChild(div);

    expect(shouldLaunchEditor(body)).toBeFalsy();
  });

  it("should hide pre element and prepare editor launch if extension enabled", function() {
    const body = document.createElement("body");
    const pre = document.createElement("pre");
    pre.setAttribute("style", "");
    body.appendChild(pre);
    chrome.storage.local.get.withArgs("disabled").yields({
      disabled: "false"
    });
    spyOn(window, "listenToEditorMessages");
    spyOn(window, "insertEditorFrame");

    prepareEditorLaunch(pre);

    expect(window.listenToEditorMessages).toHaveBeenCalled();
    expect(window.insertEditorFrame).toHaveBeenCalled();
    expect(pre.style.display).toEqual("none");
    expect(
      chrome.runtime.sendMessage.withArgs({
        action: "show_page_action"
      }).calledOnce
    ).toBeTruthy();
  });

  it("should hide pre element but reinstate it if async call has determined that extension disabled", function() {
    const body = document.createElement("body");
    const pre = document.createElement("pre");
    pre.setAttribute("style", "");
    body.appendChild(pre);
    chrome.storage.local.get.withArgs("disabled").yields({
      disabled: "true"
    });
    spyOn(window, "listenToEditorMessages");
    spyOn(window, "insertEditorFrame");

    prepareEditorLaunch(pre);

    expect(window.listenToEditorMessages).not.toHaveBeenCalled();
    expect(window.insertEditorFrame).not.toHaveBeenCalled();
    expect(pre.style.display).toEqual("");
    expect(
      chrome.runtime.sendMessage.withArgs({
        action: "show_page_action"
      }).calledOnce
    ).toBeTruthy();
  });

  it("should insert a new editor frame in the page's body", function() {
    chrome.runtime.getURL.withArgs("editor/editor.html").returns("runtime-url/editor/editor.html");

    document.body.insertBefore = jasmine.createSpy("insert-before");

    insertEditorFrame();

    const builtIframe = document.body.insertBefore.calls.mostRecent().args[0];
    expect(builtIframe.src).toContain("runtime-url/editor/editor.html");
    expect(builtIframe.style.cssText).toEqual("border: 0px none; width: 100%; height: 100%;");
    expect(document.body.style.margin).toEqual("0px");
  });

  it("should send message containing the pre element's content and remove it", function(done) {
    // Prevent tested editor script from really reacting to events.
    window.removeEventListener("message", handleLaunchEvent);
    chrome.runtime.getURL.withArgs("").returns("chrome-extension://my-app-id/");

    const pre = document.createElement("pre");
    pre.appendChild(document.createTextNode("code-content"));
    document.body.appendChild(pre);

    const postRealMessage = window.postMessage;
    spyOn(window, "postMessage").and.callFake(function(content, destination) {
      if (content !== "loaded") {
        expect(content.code).toEqual("code-content");
        expect(destination).toEqual("chrome-extension://my-app-id/");
        expect(document.getElementsByTagName("pre").length).toEqual(0);
        done();
      }
    });

    listenToEditorMessages(pre);
    postRealMessage("loaded", "*");
  });
});

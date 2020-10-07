"use strict";

var monaco;

describe("Editor script", function () {
  beforeEach(function () {
    // Dummy editor object so that we can attach spy objects in tests.
    editor = {};
    chrome.storage.local.get.flush();
    chrome.storage.local.set.flush();
  });

  it("should return supported user locale or null", function () {
    chrome.i18n.getUILanguage.returns("fr-CA");
    expect(getUserLocale()).toEqual("fr");

    chrome.i18n.getUILanguage.returns("pr-BR");
    expect(getUserLocale()).toEqual("pr-br");

    chrome.i18n.getUILanguage.returns("en");
    expect(getUserLocale()).toBeNull();
  });

  it("should prepare to launch read-only editor by inferring the language with the extension", function () {
    chrome.storage.local.get.withArgs(["editable", "theme"]).yields({
      editable: "false",
    });
    monaco = {
      languages: {
        getLanguages: function () {
          return [
            {
              id: "yaml",
              extensions: [".yaml", ".yml"],
            },
          ];
        },
      },
    };
    spyOn(window, "launchEditor");

    prepareAndLaunchEditor({
      extension: ".yml",
      code: "code-content",
    });

    expect(window.launchEditor).toHaveBeenCalledWith("code-content", false, "yaml", "vs");
  });

  it("should prepare to launch editable editor by inferring the language with the MIME type", function () {
    chrome.storage.local.get.withArgs(["editable", "theme"]).yields({
      editable: "true",
      theme: "vs-dark",
    });
    chrome.runtime.sendMessage
      .withArgs({
        action: "get_content_type",
      })
      .yields({
        contentType: "application/json",
      });
    monaco = {
      languages: {
        getLanguages: function () {
          return [];
        },
      },
    };
    spyOn(window, "launchEditor");

    prepareAndLaunchEditor({
      extension: "",
      code: "code-content",
    });

    expect(window.launchEditor).toHaveBeenCalledWith("code-content", true, "json", "vs-dark");
  });

  it("should launch editor, add actions and add resize listener", function () {
    monaco = {
      editor: {
        create: jasmine.createSpy("create-editor"),
      },
    };
    spyOn(window, "addEventListener");
    spyOn(window, "addOrUpdateEditableAction");
    spyOn(window, "addExportAction");

    launchEditor("code-content", false, "java", "vs");

    expect(monaco.editor.create).toHaveBeenCalledWith(null, {
      value: "code-content",
      scrollBeyondLastLine: false,
      readOnly: true,
      language: "java",
      cursorBlinking: "smooth",
      dragAndDrop: true,
      mouseWheelZoom: true,
      theme: "vs",
    });
    expect(window.addOrUpdateEditableAction).toHaveBeenCalledWith(false);
    expect(window.addExportAction).toHaveBeenCalled();
    expect(window.addEventListener).toHaveBeenCalledWith("resize", jasmine.any(Function));
  });

  it("should add editable action to editor and dispose and add new one if called again", function () {
    const actionRegistration = {
      dispose: jasmine.createSpy("dispose"),
    };
    editor.addAction = jasmine.createSpy("add-action").and.returnValue(actionRegistration);

    addOrUpdateEditableAction(true);

    expect(editor.addAction).toHaveBeenCalledWith({
      id: "editable",
      label: "Make read-only",
      contextMenuGroupId: "1_menu",
      contextMenuOrder: 1,
      run: jasmine.any(Function),
    });

    addOrUpdateEditableAction(false);

    expect(editor.addAction).toHaveBeenCalledWith({
      id: "editable",
      label: "Make editable",
      contextMenuGroupId: "1_menu",
      contextMenuOrder: 1,
      run: jasmine.any(Function),
    });
    expect(actionRegistration.dispose.calls.count()).toBe(1);
  });

  it("should add export action to editor", function () {
    editor.addAction = jasmine.createSpy("add-action");
    editor.getValue = function () {
      return "my-content";
    };

    addExportAction();

    expect(editor.addAction).toHaveBeenCalledWith({
      id: "export",
      label: "Export content",
      contextMenuGroupId: "1_menu",
      contextMenuOrder: 2,
      run: jasmine.any(Function),
    });

    // Execute the run function to check that it sends the correct message.
    editor.addAction.calls.mostRecent().args[0].run();
    expect(
      chrome.runtime.sendMessage.withArgs({
        action: "download_content",
        content: "my-content",
      }).calledOnce
    ).toBeTruthy();
  });

  it("should update editor, persist new state and add updated action when switched to read-only", function () {
    editor.updateOptions = jasmine.createSpy("update-options");
    spyOn(window, "addOrUpdateEditableAction");

    toggleEditable(true);

    expect(
      chrome.storage.local.set.withArgs({
        editable: "false",
      }).calledOnce
    ).toBeTruthy();
    expect(editor.updateOptions).toHaveBeenCalledWith({
      readOnly: true,
    });
    expect(window.addOrUpdateEditableAction).toHaveBeenCalledWith(false);
  });

  it("should update editor, persist new state and add updated action when switched to editable", function () {
    editor.updateOptions = jasmine.createSpy("update-options");
    spyOn(window, "addOrUpdateEditableAction");

    toggleEditable(false);

    expect(
      chrome.storage.local.set.withArgs({
        editable: "true",
      }).calledOnce
    ).toBeTruthy();
    expect(editor.updateOptions).toHaveBeenCalledWith({
      readOnly: false,
    });
    expect(window.addOrUpdateEditableAction).toHaveBeenCalledWith(true);
  });
});

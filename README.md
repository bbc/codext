<p align="center">
<img src ="https://github.com/bbc/Codext/blob/master/images/codext_logo.png?raw=true" width="20%"/>
<br/>
</p>

# Codext

<a href="https://github.com/bbc/Codext/blob/master/LICENSE">
<img src ="https://img.shields.io/github/license/bbc/Codext.svg" />
</a>

**View and edit code from within your browser!**

<p align="center" style="font-size:5px;">
<img src ="https://github.com/bbc/Codext/blob/master/screenshots/firefox_raw.png?raw=true" width="420" />
<img src ="https://github.com/bbc/Codext/blob/master/screenshots/firefox_codext.png?raw=true" width="420" />
<br />
<img src ="https://github.com/bbc/Codext/blob/master/screenshots/chrome_raw.png?raw=true" width="420" />
<img src ="https://github.com/bbc/Codext/blob/master/screenshots/chrome_codext.png?raw=true" width="420" />
<br />
<i><sub>On the left: Firefox and Chrome without Codext. On the right: same webpages with Codext enabled!</sub></i>
</p>

# Features at a glance

**Codext** harnesses the power of the [Monaco Editor](https://github.com/Microsoft/monaco-editor) by dynamically inserting it into webpages. The extension targets preformatted text (i.e. pages containing a unique `<pre>` tag) and determines the programming language to use by looking at the URL's extension and/or the returned `Content-Type` header. An editor instance is fully configured on the fly and in addition to standard editor features such as syntax highlighting, section folding and code formatting, Codext allows users to toggle editability of the document and export changes locally.

We've found Codext useful in the following scenarios:
* displaying code from online file systems or repositories.
* opening and viewing local files in your browser.
* prettifying API responses (e.g. GET requests returning JSON in Chrome).
* making quick changes to files and downloading those changes locally.
* viewing GitHub raw files in a proper editor (even though support is only partial, see [Known issues](https://github.com/bbc/Codext#Known-issues)).
* and any use-case you can think of!

# Getting started

[npm](https://github.com/npm/npm) is used to handle dependencies. Make sure it's properly configured and then run `npm i`.

[gulp](https://github.com/gulpjs/gulp) is required for the steps listed below. Use `npm install gulp-cli -g` to install the gulp command line tool.

#### :cd: Building the project

Simply run `gulp build`. The command will generate the following in the _build_ folder:
* a minified version of all the files required to run the extension. To load the extension in developer mode, point the browser to _manifest.json_ in the _build_ folder.
* a zip archive that can be used to publish the extension to the Chrome Web Store or to the Firefox Add-Ons Store.

#### :hammer: Running the tests

The [jasmine](https://github.com/jasmine/jasmine) and [sinon-chrome](https://github.com/acvetkov/sinon-chrome) libraries are used for the tests. All tested files are injected in a Jasmine spec runner document, which can be opened in a web browser to assert that the code is behaving as intended.
* to launch the test suite in Chrome, run `gulp test`.
* to launch the test suite in Firefox, run `gulp test-firefox`.

#### :chart_with_upwards_trend: Running the reporter

[ESLint](https://github.com/eslint/eslint) can be run with the `gulp lint` command.


# Contributing

#### `$ code`

Codext was built by [Pyves](https://github.com/PyvesB) and [Mika Leppala](https://github.com/MikaLeppala) during a BBC hackaton. Want to make the project better, faster, stronger? Contributions are more than welcome, open a **pull request** and share your code! Simply **fork** the repository by clicking on the icon on the top right of this page and you're ready to go!

#### :speech_balloon: Support

Thought of a cool idea? Found a problem or need some help? Simply open an [**issue**](https://github.com/bbc/Codext/issues)!

#### :star: Thanks

Find the project useful, fun or interesting? **Star** the repository by clicking on the icon on the top right of this page!

# Known issues

* Codext may not load in pages that have a CSP sandbox policy (for instance GitHub raw pages). In Chrome and Opera, this is due to a regression introduced in Chromium 64 (see [816121](https://bugs.chromium.org/p/chromium/issues/detail?id=816121)). In Firefox, a similar bug affects most recent versions of the browser (see [1267027](https://bugzilla.mozilla.org/show_bug.cgi?id=1267027)).

# Acknowledgements

The following open-source projects are used to power Codext:
* [monaco-editor](https://github.com/Microsoft/monaco-editor), released by Microsoft under the [MIT License](https://github.com/Microsoft/monaco-editor/blob/master/LICENSE.md).
* [requirejs](https://github.com/requirejs/requirejs), released under the [MIT License](https://github.com/requirejs/requirejs/blob/master/LICENSE).

# License and copyright

Apache License 2.0, see [LICENSE](https://github.com/bbc/Codext/blob/master/LICENSE) for more details.

Copyright 2018 British Broadcasting Corporation

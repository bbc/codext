const del = require("del");
const gulp = require("gulp");
const eslint = require("gulp-eslint");
const minify = require("gulp-minify");
const open = require("gulp-open");
const os = require("os");
const zip = require("gulp-zip");
const runSequence = require("run-sequence");

const paths = {
    plugin_sources: [ "background/**/*", "content/**/*", "editor/**/*", "images/**/*", "manifest.json" ],
    included_modules: [ "node_modules/monaco-editor/min/**/*", "node_modules/monaco-editor/LICENSE",
        "node_modules/requirejs/require.js" ],
    test_modules: [ "node_modules/jasmine-core/lib/jasmine-core/boot.js",
        "node_modules/jasmine-core/lib/jasmine-core/jasmine.js",
        "node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js",
        "node_modules/jasmine-core/lib/jasmine-core/jasmine.css",
        "node_modules/sinon-chrome/bundle/sinon-chrome.min.js" ]
};

gulp.task("clean", function(callback) {
    runSequence("clean-test", "clean-build", callback);
});

gulp.task("clean-test", function() {
    return del([ "tests/**/*", "!tests/spec/**", "!tests/SpecRunner.html" ]);
});

gulp.task("clean-build", function() {
    return del([ "build/**/*" ]);
});

gulp.task("build", function(callback) {
    runSequence("clean-build", "minify-sources", "include-minified-modules", "produce-zip", callback);
});

gulp.task("minify-sources", function() {
    return gulp.src(paths.plugin_sources, {
        base: "."
    }).pipe(minify({
        noSource: true,
        ext: {
            min: ".js"
        }
    })).pipe(gulp.dest("build"));
});

gulp.task("include-minified-modules", function() {
    return gulp.src(paths.included_modules, {
        base: "node_modules"
    }).pipe(minify({
        noSource: true,
        ext: {
            min: ".js"
        },
        exclude: [ "monaco-editor" ], // Already minified.
        preserveComments: "some" // Preserve licensing information in require.js.
    })).pipe(gulp.dest("build/lib"));
});

gulp.task("produce-zip", function() {
    return gulp.src("build/**/*").pipe(zip("codext.zip")).pipe(gulp.dest("build"));
});

gulp.task("test", function(callback) {
    runSequence("clean-test", "copy-test-modules", "run-tests-chrome", callback);
});

gulp.task("test-firefox", function(callback) {
    runSequence("clean", "copy-test-modules", "run-tests-firefox", callback);
});

gulp.task("copy-test-modules", function() {
    return gulp.src(paths.test_modules, {
        base: "node_modules"
    }).pipe(gulp.dest("tests"));
});

gulp.task("run-tests-chrome", function() {
    const browser = os.platform() === "linux" ? "google-chrome"
        : (os.platform() === "darwin" ? "google chrome" : "chrome");
    return gulp.src("./tests/SpecRunner.html").pipe(open({
        app: browser
    }));
});

gulp.task("run-tests-firefox", function() {
    return gulp.src("./tests/SpecRunner.html").pipe(open({
        app: "firefox"
    }));
});

gulp.task("lint", function(callback) {
    runSequence("lint-src", "lint-test", callback);
});

gulp.task("lint-src", function() {
    return gulp.src(["**/*.js","!build/**","!node_module/**","!tests/**"])
        .pipe(eslint(".eslintrc.json"))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task("lint-test", function() {
    return gulp.src(["tests/**.js","!tests/sinon-chrome/**","!tests/jasmine-core/**"])
        .pipe(eslint("tests/.eslintrc.json"))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// The default task (called when you run `gulp` from cli)
gulp.task("default", [ "build" ]);

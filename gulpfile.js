const del = require("del");
const gulp = require("gulp");
const eslint = require("gulp-eslint");
const minify = require("gulp-minify");
const open = require("gulp-open");
const os = require("os");
const zip = require("gulp-zip");

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

gulp.task("clean-test", gulp.series(function() {
    return del([ "tests/**/*", "!tests/spec/**", "!tests/SpecRunner.html" ]);
}));

gulp.task("clean-build", gulp.series(function() {
    return del([ "build/**/*" ]);
}));

gulp.task("clean", gulp.series("clean-test", "clean-build"));

gulp.task("minify-sources", gulp.series(function() {
    return gulp.src(paths.plugin_sources, {
        base: "."
    }).pipe(minify({
        noSource: true,
        ext: {
            min: ".js"
        }
    })).pipe(gulp.dest("build"));
}));

gulp.task("include-minified-modules", gulp.series(function() {
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
}));

gulp.task("produce-zip", gulp.series(function() {
    return gulp.src("build/**/*").pipe(zip("codext.zip")).pipe(gulp.dest("build"));
}));

gulp.task("copy-test-modules", gulp.series(function() {
    return gulp.src(paths.test_modules, {
        base: "node_modules"
    }).pipe(gulp.dest("tests"));
}));

gulp.task("run-tests-chrome", gulp.series(function() {
    const browser = os.platform() === "linux" ? "google-chrome"
        : (os.platform() === "darwin" ? "google chrome" : "chrome");
    return gulp.src("./tests/SpecRunner.html").pipe(open({
        app: browser
    }));
}));

gulp.task("run-tests-firefox", gulp.series(function() {
    return gulp.src("./tests/SpecRunner.html").pipe(open({
        app: "firefox"
    }));
}));

gulp.task("test", gulp.series("clean-test", "copy-test-modules", "run-tests-chrome"));

gulp.task("test-firefox", gulp.series("clean", "copy-test-modules", "run-tests-firefox"));

gulp.task("build", gulp.series("clean-build", "minify-sources", "include-minified-modules", "produce-zip"));

gulp.task("lint-src", gulp.series(function() {
    return gulp.src(["**/*.js","!build/**","!node_module/**","!tests/**"])
        .pipe(eslint(".eslintrc.json"))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}));

gulp.task("lint-test", gulp.series(function() {
    return gulp.src(["tests/**.js","!tests/sinon-chrome/**","!tests/jasmine-core/**"])
        .pipe(eslint("tests/.eslintrc.json"))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}));

gulp.task("lint", gulp.series("lint-src", "lint-test"));

// The default task (called when you run `gulp` from cli)
gulp.task("default", gulp.series("build"));

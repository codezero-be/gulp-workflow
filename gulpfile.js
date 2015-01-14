var gulp        = require('gulp'),
    gutil       = require('gulp-util'),         //=> Gulp utilities (--dev, noop(), ...)
    runSequence = require('gulp-sequence'),     //=> Run tasks synchronously
    del         = require('del'),               //=> Remove files with patterns
    concat      = require('gulp-concat'),
    rename      = require('gulp-rename'),
    sourcemaps  = require('gulp-sourcemaps'),
    browserify  = require('gulp-browserify'),   //=> Compile JavaScript files with their dependencies
    uglify      = require('gulp-uglify'),
    sass        = require('gulp-sass'),
    combineMq   = require('gulp-combine-media-queries'),
    prefix      = require('gulp-autoprefixer'),
    cssmin      = require('gulp-cssmin'),
    iconfont    = require('gulp-iconfont'),
    iconfontcss = require('gulp-iconfont-css'),
    notifier    = require('node-notifier'),     //=> For notifications not via .pipe()
    notify      = require('gulp-notify');       //=> For notifications via .pipe()

// ====================================================================================
// ~~~ CONFIGURATION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

/**
 * Base Paths
 */

var basePaths = {
    assets: 'assets/',
    bower: 'bower_components/',
    compiled: 'temp/',
    production: 'public/'
};

/**
 * Source and Destination Folders
 */

var paths = {
    scripts: {
        src: basePaths.assets + 'js/',
        compiled: basePaths.compiled + '',
        production: basePaths.production + 'js/'
    },
    styles: {
        src: basePaths.assets + 'sass/',
        compiled: basePaths.compiled + '',
        production: basePaths.production + 'css/'
    }
};

/**
 * Source Files to Compile
 * Styles: SASS / Scripts: Browserify
 */

var srcFiles = {
    styles: paths.styles.src + '**/*.scss',
    scripts: [paths.scripts.src + 'main.js']
};

/**
 * Output Files (compiled, concatenated and minified)
 * These will be placed in the "compiled" or "production" folder...
 */

var destFiles = {
    styles: {
        compiled: 'main.css', //=> This one must match: main.scss => main.css
        production: 'styles.css'
    },
    scripts: {
        compiled: 'main.js',
        production: 'scripts.js'
    }
};

/**
 * Files to Concatenate
 */

var concatFiles = {
    styles: [
        basePaths.bower + 'normalize.css/normalize.css',
        paths.styles.compiled + destFiles.styles.compiled //=> SASS Output
    ],
    scripts: [
        basePaths.bower + 'modernizr/modernizr.js',
        basePaths.bower + 'jquery/dist/jquery.js',
        paths.scripts.compiled + destFiles.scripts.compiled //=> Browserify Output
    ]
};

/**
 * Icon Font Settings
 */

var iconFont = {
    name : 'icon-font',
    paths : {
        src: basePaths.assets + 'icon-font/',
        dest: basePaths.production + 'fonts/',
        css2font: '../fonts/' //=> Reference to the font in the CSS file
    },
    css : {
        src: basePaths.assets + 'icon-font-template.scss',
        dest: paths.styles.src + '_icon-font.scss'
    }
}

/**
 * Compile Mode
 */

// Run gulp with these default settings:
var isProduction = true,
    sassStyle = 'compressed',
    sourceMap = false,
    combineMediaQueries = true,
    cleanUpFiles = true;

// Run gulp --dev to use these alternate settings:
if (gutil.env.dev === true) {
    isProduction = false;
    sassStyle = 'expanded';
    sourceMap = true,
    combineMediaQueries = false,
    cleanUpFiles = false;
}

// Browser compatibility for CSS
var cssBrowsers = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

// ====================================================================================
// ~~~ CSS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

/**
 * Compile SASS:
 * - Compile SASS with source maps (dev)
 * - Compile SASS without source maps (production)
 * - Combine media queries (production) (source maps won't work well with this)
 * - Add browser prefixes
 * - Minify CSS (production)
 */

gulp.task('compile-sass', function () {
    // Fetch SASS files
    return gulp.src(srcFiles.styles)

        // Start SASS source map
        .pipe(sourceMap ? sourcemaps.init() : gutil.noop())

        // Compile SASS
        .pipe(sass({outputStyle: sassStyle}))
        .on('error', notifySASSError)

        // Save SASS source map
        .pipe(sourceMap ? sourcemaps.write() : gutil.noop())

        // Start new source map and load SASS source map
        .pipe(sourceMap ? sourcemaps.init({loadMaps: true}) : gutil.noop())

        // Combine media queries (source maps won't work well with this)
        .pipe(combineMediaQueries ? combineMq() : gutil.noop())

        // Add browser prefixes
        .pipe(prefix(cssBrowsers))

        // Save source map
        .pipe(sourceMap ? sourcemaps.write() : gutil.noop())

        // Save compiled CSS file
        .pipe(gulp.dest(paths.styles.compiled));
});

/**
 * SASS Task with notification
 */

gulp.task('sass', function (cb) {
    runSequence('compile-sass', 'css-notification', cb);
});

/**
 * SASS Watcher
 */

gulp.task('watch-sass', function () {
    gulp.watch(srcFiles.styles, ['sass']);
});

/**
 * Concatenate CSS:
 * - Concatenate CSS files with source maps (dev)
 * - Concatenate CSS files without source maps (production)
 * - Combine media queries (production) (source maps won't work well with this)
 * - Add browser prefixes
 * - Minify CSS (production)
 */

gulp.task('concat-css', function () {
    // Fetch CSS files
    return gulp.src(concatFiles.styles)

        // Start source map
        .pipe(sourceMap ? sourcemaps.init({loadMaps: true}) : gutil.noop())

        // Concatenate files
        .pipe(concat(destFiles.styles.production))

        // Combine media queries (source maps won't work well with this)
        .pipe(combineMediaQueries ? combineMq() : gutil.noop())

        // Add browser prefixes
        .pipe(prefix(cssBrowsers))

        // Minify CSS (production)
        .pipe(isProduction ? cssmin({keepSpecialComments: 0}) : gutil.noop())

        // Save source map
        .pipe(sourceMap ? sourcemaps.write() : gutil.noop())

        // Save output to destination folder
        .pipe(gulp.dest(paths.styles.production));
});

/**
 * Clean Up CSS Output (production)
 */

gulp.task('cleanup-css', function (cb) {
    cleanUp([paths.styles.compiled + destFiles.styles.compiled], cb);
});

/**
 * Default CSS Task:
 * - Compile SASS
 * - Concatenate
 * - Minify
 * - Clean Up Output
 */

gulp.task('css', function (cb) {
    runSequence('compile-sass', 'concat-css', 'cleanup-css', 'css-notification', cb);
});

/**
 * CSS Watcher
 */

gulp.task('watch-css', function () {
    gulp.watch(srcFiles.styles, ['css']);
});

/**
 * Show CSS Success Notification
 */

gulp.task('css-notification', function () {
    notifySuccess('CSS Compiled Successfully!');
});

// ====================================================================================
// ~~~ JAVASCRIPT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

/**
 * Browserify JS:
 * - Compile the main JS file with it's dependencies/modules
 */

gulp.task('browserify-js', function () {
    // Fetch JS files
    return gulp.src(srcFiles.scripts)

        // Compile main JS file with dependencies/modules
        .pipe(browserify({debug: sourceMap}))
        .on('error', notifyJSError)

        // Rename output JS file
        .pipe(rename(destFiles.scripts.compiled))

        // Save output to destination folder
        .pipe(gulp.dest(paths.scripts.compiled));
});

/**
 * Browserify JS Task with notification
 */

gulp.task('browserify', function (cb) {
    runSequence('browserify-js', 'js-notification', cb);
});

/**
 * Browserify JS Watcher
 */

gulp.task('watch-browserify', function () {
    gulp.watch(paths.scripts.src + '**/*.js', ['browserify']);
});

/**
 * Concatenate JS:
 * - Concatenate JS files with source maps (dev)
 * - Concatenate JS files without source maps (production)
 * - Uglify JS (production)
 */

gulp.task('concat-js', function () {
    // Fetch CSS files
    return gulp.src(concatFiles.scripts)

        // Start source map
        .pipe(sourceMap ? sourcemaps.init({loadMaps: true}) : gutil.noop())

        // Concatenate files
        .pipe(concat(destFiles.scripts.production))

        // Uglify JS (production)
        .pipe(isProduction ? uglify() : gutil.noop())

        // Save source map
        .pipe(sourceMap ? sourcemaps.write() : gutil.noop())

        // Save output to destination folder
        .pipe(gulp.dest(paths.scripts.production));
});

/**
 * Clean Up JS Output (production)
 */

gulp.task('cleanup-js', function (cb) {
    cleanUp([paths.scripts.compiled + destFiles.scripts.compiled], cb);
});

/**
 * Show JS Success Notification
 */

gulp.task('js-notification', function () {
    notifySuccess('JS Compiled Successfully!');
});

/**
 * Default JS Task:
 * - Browserify
 * - Concatenate
 * - Uglify
 * - Clean Up Output
 */

gulp.task('js', function (cb) {
    runSequence('browserify-js', 'concat-js', 'cleanup-js', 'js-notification', cb);
});

/**
 * JS Watcher
 */

gulp.task('watch-js', function () {
    gulp.watch(paths.scripts.src + '**/*.js', ['js']);
});

// ====================================================================================
// ~~~ ICON FONT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

/**
 * Compile Icon Font
 */

gulp.task('compile-icon-font', function () {
    // Fetch SVG files
    gulp.src([iconFont.paths.src + '*.svg'], {base: '.'})

        // Create font CSS
        .pipe(iconfontcss({
            fontName: iconFont.name,
            path: iconFont.css.src,
            targetPath: getRoot(iconFont.paths.dest) + iconFont.css.dest,
            fontPath: iconFont.paths.css2font
        }))

        // Create font
        .pipe(iconfont({fontName: iconFont.name, normalize: true}))

        // Save font files
        .pipe(gulp.dest(iconFont.paths.dest));
});

/**
 * Show Icon Font Success Notification
 */

gulp.task('icon-font-notification', function () {
    notifySuccess('Icon Font Compiled Successfully!');
});

/**
 * Default Icon Font Task:
 * - Compile
 */

gulp.task('icon-font', function (cb) {
    runSequence('compile-icon-font', 'icon-font-notification', cb);
});

/**
 * Icon Font Watcher
 */

gulp.task('watch-icon-font', function () {
    gulp.watch(iconFont.paths.src + '*.svg', ['icon-font']);
});

// ====================================================================================
// ~~~ DEFAULT TASK ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

gulp.task('default', function (cb) {
    runSequence('icon-font', 'css', 'js', ['watch-icon-font', 'watch-css', 'watch-js'], cb);
});

// ====================================================================================
// ~~~ HELPER METHODS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

/**
 * Get Project Root
 */

function getRoot(path)
{
    var backPath = '',
        depth = (path.match(/\//g) || []).length;

    for (var i = 0; i < depth; i++) {
        backPath += '../';
    }

    return backPath;
}

/* *
 * Clean Up Files
 */

function cleanUp(pattern, cb) {
    if (cleanUpFiles == false) {
        // Prevent task from hanging
        // and run del command anyway!
        pattern = ['nothing.toDelete'];
    }

    del(pattern, cb);
}

/**
 * Error Handlers
 */

// Keep track of errors for
// success notification...
var hasErrors = false;

function notifySASSError(err) {
    hasErrors = true;

    console.log(err.toString());

    notify.onError({
        title: 'Ooops...',
        message: 'Error compiling SASS!',
        sound: 'Sosumi'
    })(err);

    this.emit('end');
}

function notifyJSError(err) {
    hasErrors = true;

    console.log(err.toString());

    notify.onError({
        title: 'Ooops...',
        message: 'Error compiling JS!',
        sound: 'Sosumi'
    })(err);

    this.emit('end');
}

/**
 * Success Notification
 */

function notifySuccess(msg) {
    if (hasErrors == false) {
        notifier.notify({
            title: 'Yaaay!',
            message: msg
        });
    }

    hasErrors = false;
}
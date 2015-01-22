var gulp        = require('gulp'),
    gutil       = require('gulp-util'),         //=> Gulp utilities (--dev, noop(), ...)
    runSequence = require('gulp-sequence'),     //=> Run tasks synchronously
    del         = require('del'),               //=> Remove files with patterns
    concat      = require('gulp-concat'),
    sourcemaps  = require('gulp-sourcemaps'),
    browserify  = require('gulp-browserify'),   //=> Compile JavaScript files with their dependencies
    uglify      = require('gulp-uglify'),
    sass        = require('gulp-sass'),
    combineMq   = require('gulp-combine-media-queries'),
    prefix      = require('gulp-autoprefixer'),
    cssmin      = require('gulp-cssmin'),
    iconfont    = require('gulp-iconfont'),
    iconfontcss = require('gulp-iconfont-css'),
    phpspec     = require('gulp-phpspec'),
    imagemin    = require('gulp-imagemin'),
    newer       = require('gulp-newer'),
    browserSync = require('browser-sync'),
    notifier    = require('node-notifier'),     //=> For notifications not via .pipe()
    notify      = require('gulp-notify');       //=> For notifications via .pipe()

// ====================================================================================
// ~~~ CONFIGURATION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

var dev = !! gutil.env.dev;
var production = ! dev;
var config = {};

/**
 * CSS Configuration
 */

config.css = {
    sourceMaps: dev,
    combineMediaQueries: production,
    autoPrefix: {
        enabled: true,
        browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
    },
    minify: production,

    // SASS Settings
    sass: {
        defaultTask: true, //=> Include this task in the default Gulp task?
        src: 'assets/sass/',
        dest: 'compiled/',
        clearCompiled: production //=> This will delete all *.css files from the dest folder when all tasks are done!
    },

    // Concatenation Settings
    concat: {
        defaultTask: true,
        files: [
            'bower_components/normalize.css/normalize.css',
            'compiled/main.css' //=> SASS output
        ],
        outputFilename: 'styles.css',
        dest: 'public/css/'
    }
};

/**
 * JS Configuration
 */

config.js = {
    sourceMaps: dev,
    uglify: production,

    // Browserify Settings
    browserify: {
        defaultTask: true,
        src: 'assets/js/',
        mainFilename: 'main.js',
        dest: 'compiled/',
        clearCompiled: production //=> This will delete all *.js files from the dest folder when all tasks are done!
    },

    // Concatenation Settings
    concat: {
        defaultTask: true,
        files: [
            'bower_components/jquery/dist/jquery.min.js',
            'compiled/main.js' //=> Browserify output
        ],
        outputFilename: 'scripts.js',
        dest: 'public/js/'
    }
};

/**
 * Icon Font Configuration
 */

config.iconFont = {
    defaultTask: true,
    name : 'icon-font',
    src: 'assets/icon-font/',
    dest: 'public/fonts/',
    css : {
        template: 'assets/icon-font-template.scss',
        dest: config.css.sass.src + '_icon-font.scss',
        fontPath: '../fonts/' //=> Relative path from the CSS file to the font
    }
};

/**
 * Image Optimalization Configuration
 */

config.images = {
    defaultTask: true,
    src: 'assets/images/',
    dest: 'public/images/'
};

/**
 * PHPSpec Configuration
 */

// Make sure you also set the correct
// mappings in phpspec.yml
config.phpspec = {
    spec: 'spec/',
    php: 'src/'
};

/**
 * Browser Sync Configuration
 */

config.sync = {
    defaultTask: true,
    root: 'public/',
    proxy: null, //=> Don't start a server but use an existing host (ex.: "app.dev")
    open: "external" //=> Open browser automatically (false|"local"|"external")
};

// ====================================================================================
// ~~~ BROWSER SYNC ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

/**
 * Sync Browsers
 */

var bsOptions = {
    // Watch these files for changes
    files: [
        config.sync.root + "**/*.css",
        config.sync.root + "**/*.html",
        config.sync.root + "**/*.php",
        config.sync.root + "**/*.js"
    ],
    // Don't show any notifications in the browser
    notify: false,
    // Open browser automatically
    open: config.sync.open
};

if (config.sync.proxy) {
    bsOptions.proxy = config.sync.proxy
} else {
    bsOptions.server = {
        baseDir: config.sync.root
    }
}

gulp.task('browser-sync', function () {
    browserSync(bsOptions);
});

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
    return gulp.src(config.css.sass.src + '**/*.scss')

        // Start SASS source map
        .pipe(config.css.sourceMaps ? sourcemaps.init() : gutil.noop())

        // Compile SASS
        .pipe(sass())
        .on('error', notifySASSError)

        // Save SASS source map
        .pipe(config.css.sourceMaps ? sourcemaps.write() : gutil.noop())

        // Start new source map and load SASS source map
        .pipe(config.css.sourceMaps ? sourcemaps.init({loadMaps: true}) : gutil.noop())

        // Combine media queries (source maps won't work well with this)
        .pipe(config.css.combineMediaQueries ? combineMq() : gutil.noop())

        // Add browser prefixes
        .pipe(config.css.autoPrefix.enabled ? prefix(config.css.autoPrefix.browsers) : gutil.noop())

        // Minify CSS (production)
        .pipe(config.css.minify ? cssmin({keepSpecialComments: 0}) : gutil.noop())

        // Save source map
        .pipe(config.css.sourceMaps ? sourcemaps.write() : gutil.noop())

        // Save compiled CSS file
        .pipe(gulp.dest(config.css.sass.dest));
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
    gulp.watch(config.css.sass.src + '**/*.scss', ['sass']);
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
    return gulp.src(config.css.concat.files)

        // Start source map
        .pipe(config.css.sourceMaps ? sourcemaps.init({loadMaps: true}) : gutil.noop())

        // Concatenate files
        .pipe(concat(config.css.concat.outputFilename))

        // Combine media queries (source maps won't work well with this)
        .pipe(config.css.combineMediaQueries ? combineMq() : gutil.noop())

        // Add browser prefixes
        .pipe(config.css.autoPrefix.enabled ? prefix(config.css.autoPrefix.browsers) : gutil.noop())

        // Minify CSS (production)
        .pipe(config.css.minify ? cssmin({keepSpecialComments: 0}) : gutil.noop())

        // Save source map
        .pipe(config.css.sourceMaps ? sourcemaps.write() : gutil.noop())

        // Save output to destination folder
        .pipe(gulp.dest(config.css.concat.dest));
});

/**
 * Clean Up CSS Output (production)
 */

gulp.task('cleanup-css', function (cb) {
    var pattern = config.css.sass.clearCompiled
        ? config.css.sass.dest + '*.css'
        : 'nothing.toDelete';

    del([pattern], cb);
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
    gulp.watch(config.css.sass.src + '**/*.scss', ['css']);
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
 * - Use source maps (dev)
 * - Uglify JS (production)
 */

gulp.task('browserify-js', function () {
    // Fetch JS files
    return gulp.src(config.js.browserify.src + config.js.browserify.mainFilename)

        // Compile main JS file with dependencies/modules
        .pipe(browserify({debug: config.js.sourceMaps}))
        .on('error', notifyJSError)

        // Start source map
        .pipe(config.js.sourceMaps ? sourcemaps.init({loadMaps: true}) : gutil.noop())

        // Uglify JS (production)
        .pipe(config.js.uglify ? uglify() : gutil.noop())

        // Save source map
        .pipe(config.js.sourceMaps ? sourcemaps.write() : gutil.noop())

        // Save output to destination folder
        .pipe(gulp.dest(config.js.browserify.dest));
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
    gulp.watch(config.js.browserify.src + '**/*.js', ['browserify']);
});

/**
 * Concatenate JS:
 * - Concatenate JS files with source maps (dev)
 * - Concatenate JS files without source maps (production)
 * - Uglify JS (production)
 */

gulp.task('concat-js', function () {
    // Fetch CSS files
    return gulp.src(config.js.concat.files)

        // Start source map
        .pipe(config.js.sourceMaps ? sourcemaps.init({loadMaps: true}) : gutil.noop())

        // Concatenate files
        .pipe(concat(config.js.concat.outputFilename))

        // Uglify JS (production)
        .pipe(config.js.uglify ? uglify() : gutil.noop())

        // Save source map
        .pipe(config.js.sourceMaps ? sourcemaps.write() : gutil.noop())

        // Save output to destination folder
        .pipe(gulp.dest(config.js.concat.dest));
});

/**
 * Clean Up JS Output (production)
 */

gulp.task('cleanup-js', function (cb) {
    var pattern = config.js.browserify.clearCompiled
        ? config.js.browserify.dest + '*.js'
        : 'nothing.toDelete';

    del([pattern], cb);
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
    gulp.watch(config.js.browserify.src + '**/*.js', ['js']);
});

// ====================================================================================
// ~~~ ICON FONT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

/**
 * Compile Icon Font
 */

gulp.task('compile-icon-font', function () {
    // Fetch SVG files
    return gulp.src([config.iconFont.src + '*.svg'], {base: '.'})

        // Create font CSS
        .pipe(iconfontcss({
            fontName: config.iconFont.name,
            path: config.iconFont.css.template,
            targetPath: getRoot(config.iconFont.dest) + config.iconFont.css.dest,
            fontPath: config.iconFont.css.fontPath
        }))

        // Create font
        .pipe(iconfont({fontName: config.iconFont.name, normalize: true}))

        // Save font files
        .pipe(gulp.dest(config.iconFont.dest));
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
    gulp.watch(config.iconFont.src + '*.svg', ['icon-font']);
});

// ====================================================================================
// ~~~ IMAGE OPTIMIZATION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

/**
 * Optimize Images
 */

gulp.task('optimize-images', function () {
    // Fetch original images
    return gulp.src(config.images.src + '**')

        // Only process the ones that changed
        .pipe(newer(config.images.dest))

        // Optimize images
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))

        // Save optimized images
        .pipe(gulp.dest(config.images.dest));
});

/**
 * Show Image Optimization Success Notification
 */

gulp.task('images-notification', function () {
    notifySuccess('All images are optimized!');
});

/**
 * Default Image Optimization Task:
 */

gulp.task('images', function (cb) {
    runSequence('optimize-images', 'images-notification', cb);
});

/**
 * Image Optimization Watcher
 */

gulp.task('watch-images', ['images'], function () {
    gulp.watch([config.images.src + '**'], ['images']);
});

// ====================================================================================
// ~~~ PHPSPEC ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

/**
 * Run PHPSpec Tests
 */

gulp.task('run-phpspec', function () {
    // Fetch tests
    return gulp.src(config.phpspec.spec + '**/*.php')

        // Run tests
        .pipe(phpspec('', {notify: true}))
        .on('error', notifyPHPSpecError);
});

/**
 * Show PHPSpec Success Notification
 */

gulp.task('phpspec-notification', function () {
    notifySuccess('PHPSpec: All Tests Successful!');
});

/**
 * Default PHPSpec Task:
 */

gulp.task('phpspec-once', function (cb) {
    runSequence('run-phpspec', 'phpspec-notification', cb);
});

/**
 * PHPSpec Watcher
 */

gulp.task('phpspec', ['phpspec-once'], function () {
    gulp.watch([config.phpspec.spec + '**/*.php', config.phpspec.php + '**/*.php'], ['phpspec-once']);
});

// ====================================================================================
// ~~~ DEFAULT TASK ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

gulp.task('default', function (cb) {
    runSequence('images', 'icon-font', 'css', 'js', ['browser-sync', 'watch-images', 'watch-icon-font', 'watch-css', 'watch-js'], cb);
});

// ====================================================================================
// ~~~ HELPER METHODS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ====================================================================================

/**
 * Get Project Root
 */

function getRoot(path) {
    var backPath = '',
        depth = (path.match(/\//g) || []).length;

    for (var i = 0; i < depth; i++) {
        backPath += '../';
    }

    return backPath;
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

function notifyPHPSpecError(err) {
    hasErrors = true;

    console.log(err.toString());

    notify.onError({
        title: 'Ooops...',
        message: 'One or more PHPSpec tests failed!',
        sound: 'Sosumi'
        //icon: __dirname + '/fail.png'
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
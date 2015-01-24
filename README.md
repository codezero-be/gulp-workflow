# Gulp Workflow #

This is a sample project that uses [Gulp](http://gulpjs.com/) to:

- Copy files to a specific folder
- Optimize images
- Create your own webfont from SVG icons
- Compile SASS and JavaScript ([Browserify](http://browserify.org/))
- Concatenate files
- Add CSS browser prefixes
- Minify CSS / Uglify JS
- Sync changes to CSS/JS/HTML/PHP between browsers/devices ([BrowserSync](http://www.browsersync.io/docs/gulp/))
- [Read more...](#using-this-gulpfile)

You can also keep watch on your [PHPSpec](http://www.phpspec.net/) tests. These have their own [separate tasks](#using-this-gulpfile).

## System Requirements ##

To use [Gulp](http://gulpjs.com/), you will need to have a few programs installed on your machine:

- [NodeJS](http://nodejs.org/)
- [Git Bash Console](http://git-scm.com/) (recommended if you're on Windows)

If you want to run [PHPSpec](http://www.phpspec.net/), then you will also need to install:

- [PHP](http://php.net/) (Windows users: unzip and update your PATH)
- [Composer](https://getcomposer.org/)

## Install Gulp & Dependencies ##

### Gulp ###

First, install [Gulp](http://gulpjs.com/) globally on your machine: (only once)

    npm install -g gulp

### Bower ###

Install [Bower](http://bower.io/) globally on your machine: (only once)

    npm install -g bower

With [Bower](http://bower.io/) you can easily manage third party JS and CSS packages. Thanks to the [debowerify](https://github.com/eugeneware/debowerify) package, you can require Bower dependencies with Browserify:

    var $ = require('jquery'); //=> Bower Package
    
    module.exports = function() {
        $('div').animate({
            width: "200px"
        }, 500);
    }

> **IMPORTANT:** Note that this only works if the package has set a main script in their `bower.json` file: `main: "dist/jquery.js"`! 

### BrowserSync (optional)

If you want to use [BrowserSync](http://www.browsersync.io/docs/gulp/), install it globally aswell:

    npm install -g browser-sync

With [BrowserSync](http://www.browsersync.io/docs/gulp/) all browsers and devices that are connected to your BrowserSync URL will be automatically updated on HTML, CSS and JS changes. Scrolling will also be synced on all connected devices!

### Project Dependencies ###

Next, install Gulp and our dependencies in this project:

    npm install

> **TIP:** When `npm install` has finished it will automatically trigger `bower install`.

## Install PHPSpec (optional) ##

If you have [PHP](http://php.net/) and [Composer](https://getcomposer.org/) installed, you can install PHPSpec, which is already added as a dependency in the `composer.json` file.

    composer install

# Project Structure #

This is the default project structure, but all folders can be changed in `gulpfile.js`.

- `gulpfile.js` : It's all about this script!
- `package.json` : NodeJS packages (Gulp dependencies, etc.)
- `bower.json` : Frontend dependencies (jQuery, etc.)
- `composer.json` : PHP dependencies (PHPSpec, etc.)
- `phpspec.yml` : PHPSpec configuration file
- `assets/images/` : Original images, to be optimized 
- `assets/icon-font/` : SVG icons that will be compiled into a webfont
- `assets/sass/_icon-font.scss` : Generated SASS file for the webfont 
- `assets/sass/` : SASS source files  
- `assets/js/` : JavaScript source files
- `compiled/` : Compiled SASS and JavaScript files (not yet concatenated)
- `public/images` : Optimized images
- `public/fonts/` : Webfont generated from SVG icons
- `public/css/` : CSS production file (compiled, concatenated, ...)
- `public/js/` : JavaScript production file (compiled, concatenated, ...)
- `src/` : PHP Classes (PSR-4 autloaded with the `App` namespace)
- `spec/` : PHPSpec tests

> The webfont's SASS file is generated from a template in the `assets` folder. Example icon made by [Freepik](http://www.freepik.com/) from [Flaticon](http://www.flaticon.com/) is licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/).

# Using This Gulpfile #

> **TIP:** if you don't want all the "Starting" and "Finished" task logging in the console window, then use the `--silent` option when you run `gulp`.

## Run `gulp` to: ##

- Copy files to a specific folder
- Optimize images
- Compile SVG icons into a webfont and create a SASS file
- Compile SASS and JS ([Browserify](http://browserify.org/))
- Concatenate with vendor CSS and JS files
- Combine CSS media queries
- Add browser prefixes to CSS
- Minify CSS / Uglify JS
- Remove compiled CSS and JS files and only keep the one used for production
- Start watching SVG files, SASS and JS for changes
- Sync changes to CSS/JS/HTML/PHP between browsers/devices ([BrowserSync](http://www.browsersync.io/docs/gulp/))

## Run `gulp --dev` to do the above, but: ##

- Use source maps for debugging
- **DO NOT** combine CSS media queries (does not work well with source maps)
- **DO NOT** Minify CSS / Uglify JS
- **DO NOT** remove compiled CSS and JS files

## Run `gulp phpspec` to: ##

- Run PHPSpec tests and start watching for changes

## Additional (more specific) tasks: ##

- `gulp browser-sync` : Sync changes to CSS/JS/HTML/PHP between browsers/devices ([BrowserSync](http://www.browsersync.io/docs/gulp/))

### Run tasks, but don't watch for changes: ###

- `gulp copy` : Copy files to a specific folder
- `gulp images` : Optimize images
- `gulp icon-font` : Compile SVG icons into a webfont and create the SASS file
- `gulp css` : Run all CSS tasks
- `gulp js` : Run all JS tasks

### Watch for changes and then run all tasks: ###

- `gulp watch-copy` : Watch specified files and copy them to a folder
- `gulp watch-images` : Watch image assets and optimize them
- `gulp watch-icon-font` : Watch SVG icons, compile them into a webfont
- `gulp watch-css` : Watch SASS files for changes and run all CSS tasks
- `gulp watch-js` : Watch JS files for changes and run all JS tasks

### Compile only (don't concatenate other files): ###

- `gulp sass` : Compile SASS, combine media queries, add prefixes, minify
- `gulp watch-sass` : Watch SASS files for changes and compile SASS, combine media queries, add prefixes, minify
- `gulp browserify` : Compile JS, uglify
- `gulp watch-browserify` : Watch JS files for changes, compile JS, uglify

### Concatenate files only (no SASS or Browserify): ###

- `gulp concat-css` : Concatenate CSS files, combine media queries, add prefixes, minify
- `gulp concat-js` : Concatenate JS files, uglify

### Clean up compiled files: ###

- `gulp cleanup-css` : Remove compiled CSS file and only keep the one used for production
- `gulp cleanup-js` : Remove compiled JS file and only keep the one used for production

> **TIP:** You can use `--dev` to prevent minification, save source maps and keep compiled files. This behavior is configurable in `gulpfile.js`.

---
[![Analytics](https://ga-beacon.appspot.com/UA-58876018-1/codezero-be/gulp-workflow)](https://github.com/igrigorik/ga-beacon)
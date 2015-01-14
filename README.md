# Gulp Workflow #

This is a sample project that uses [Gulp](http://gulpjs.com/) to:

- Create your own webfont from SVG icons
- Compile SASS and JavaScript ([Browserify](http://browserify.org/))
- Concatenate files
- Add CSS browser prefixes
- Minify CSS / Uglify JS
- [Read more...](#using-this-gulpfile)

## System Requirements ##

To use [Gulp](http://gulpjs.com/), you will need to have a few programs installed on your machine:

- [NodeJS](http://nodejs.org/)
- [Git Bash Console](http://git-scm.com/) (recommended if you're on Windows)

## Install Gulp & Dependencies ##

First, install [Gulp](http://gulpjs.com/) globally on your machine: (only once)

    npm install -g gulp

Next, install Gulp and our dependencies in this project:

    npm install

## Install Bower & Packages (optional) ##

First, install [Bower](http://bower.io/) globally on your machine:

    npm install -g bower

Install the third party packages that are used in this sample project (Modernizr, normalize.css, jQuery):

    bower install

> If you don't want to use Bower, make sure you edit the `concatFiles` array in `gulpfile.js`.

# Project Structure #

This is the default project structure, but all folders can be changed in `gulpfile.js`.

- `assets/icon-font/` : SVG icons that will be compiled into a webfont
- `assets/sass/_icon-font.scss` : Generated SASS file for the webfont 
- `assets/sass/` : SASS source files  
- `assets/js/` : JavaScript source files
- `temp/` : Compiled SASS and JavaScript files (not yet concatenated)
- `public/fonts/` : Webfont generated from SVG icons
- `public/css/` : CSS production file (compiled, concatenated, ...)
- `public/js/` : JavaScript production file (compiled, concatenated, ...)

> The webfont's SASS file is generated from a template in the `assets` folder. Example icon made by [Freepik](http://www.freepik.com/) from [Flaticon](http://www.flaticon.com/) is licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/).

# Using This Gulpfile #

## Run `gulp` to: ##

- Compile SVG icons into a webfont and create a SASS file
- Compile SASS and JS ([Browserify](http://browserify.org/))
- Concatenate with vendor CSS and JS files
- Combine CSS media queries
- Add browser prefixes to CSS
- Minify CSS / Uglify JS
- Remove compiled CSS and JS files and only keep the one used for production
- Start watching SVG files, SASS and JS for changes

## Run `gulp --dev` to do the above, but: ##

- Use source maps for debugging
- **DO NOT** combine CSS media queries (does not work well with source maps)
- **DO NOT** Minify CSS / Uglify JS
- **DO NOT** remove compiled CSS and JS files

## Additional (more specific) tasks: ##

### Run tasks, but don't watch for changes: ###

- `gulp css` : Run all CSS tasks
- `gulp js` : Run all JS tasks

### Watch for changes and then run all tasks: ###

- `gulp watch-css` : Watch SASS files for changes and run all CSS tasks
- `gulp watch-js` : Watch JS files for changes and run all JS tasks

### Compile only (don't concatenate other files): ###

- `gulp icon-font` : Compile SVG icons into a webfont and create the SASS file
- `gulp watch-icon-font` : Watch SVG icons, compile them into a webfont
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

> You can use `--dev` to prevent minification, save source maps and keep compiled files. This behavior is configurable.
// Import Gulp
var gulp = require('gulp');

// Import funciton modules
var autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  minifycss = require('gulp-clean-css'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  notify = require('gulp-notify'),
  rename = require('gulp-rename'),
  del = require('del');

// Error handle
var plumber = require("gulp-plumber");

// Relative path
var paths = {
  css: './css/',
  js: './js/',
  dist: './asserts/'
}

gulp.task('css', function() {
  gulp.src([paths.css + '**/*.css'])
    .pipe(plumber())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(minifycss())
    .pipe(concat('app.min.css'))
    .pipe(gulp.dest(paths.dist));
  return notify({ message: 'css compress finished' });
});

gulp.task('js', function() {
  gulp.src([paths.js + 'jquery.js', paths.js + 'juicer.js', paths.js + 'q.js', paths.js + 'app.js'])
    .pipe(plumber())
    .pipe(jshint())
    .pipe(uglify({compress: {drop_console: true}}))
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest(paths.dist));
  return notify({ message: 'js compress finished' });
});

// Watch The File Change Action And Minify It
gulp.task('watch', function() {
  gulp.watch([paths.js + '*.css'], ['css']);
  gulp.watch([paths.css + '*.js'], ['js']);
});

gulp.task('default', ['watch']);
gulp.task('watch:base', ['watch']);

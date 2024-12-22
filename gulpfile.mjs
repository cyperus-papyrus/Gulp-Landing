import { src, dest, parallel, series, watch } from 'gulp';
import browserSync from 'browser-sync';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
const sass = gulpSass(dartSass);
import autoprefixer from 'gulp-autoprefixer';
import cleancss from 'gulp-clean-css';
import plumber from 'gulp-plumber';
import pug from 'gulp-pug';
import { deleteAsync } from 'del';
import concat from 'gulp-concat'
import sourcemaps from 'gulp-sourcemaps';
import changed from 'gulp-changed';
import imagemin from 'gulp-imagemin';

const path = {
	src: {
	  css: 'src/scss/*.scss',
	  js: 'src/js/*.js',
	  html: 'src/templates/*.pug',
	  img: 'src/img/**/*',
	  fonts: 'src/fonts/*',
	},
	build: {
	  css: 'build/static/css/',
	  js: 'build/static/js/',
	  fonts: 'build/static/fonts',
	  html: 'build/',
	  img: 'build/static/img',
	},
	watch: {
	  css: 'src/scss/*.scss',
	  html: 'src/templates/**/*.pug',
	  js: 'src/js/*.js',
    img: 'src/img/**/*',
	},
  };

const { src: srcPath, build: buildPath, watch: watchPath } = path;

function browsersync(done) {
  browserSync.init({
    server: { baseDir: buildPath.html },
    notify: false,
    online: true,
    port: 8080,
    open: false,
  });
  done();
}

function scripts() {
  return src(srcPath.js)
  .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(buildPath.js))
    .pipe(browserSync.stream());
}

function styles() {
  return src(srcPath.css)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass())
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(cleancss({ level: { 1: { specialComments: 0 } }}))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(buildPath.css))
    .pipe(browserSync.stream());
}

function html() {
  return src(srcPath.html)
    .pipe(pug({ pretty: true }))
    .pipe(dest(buildPath.html))
    .on('end', browserSync.reload);
}

function imagesAll() {
  return src(srcPath.img, { encoding: false })
    .pipe(imagemin())
    .pipe(dest(buildPath.img));
}

function imagesChanged() {
  return src(srcPath.img, { encoding: false })
    .pipe(changed(buildPath.img))
    .pipe(imagemin())
    .pipe(dest(buildPath.img));
}

function fonts(){
	return src(path.src.fonts,{encoding: false})
		.pipe(dest(path.build.fonts))
		.pipe(browserSync.stream({ once: true }));
}
 

function cleanbuild() {
  return deleteAsync(buildPath.html);
}

function startwatch(done) {
  watch(watchPath.js, scripts);
  watch(watchPath.css, styles);
  watch(watchPath.html, html);
  watch(watchPath.img, imagesChanged)
  done();
}

export default series(cleanbuild, parallel(styles, scripts, html, imagesAll, fonts));
export const serve = series(parallel(styles, scripts, html, imagesChanged), parallel(browsersync, startwatch));
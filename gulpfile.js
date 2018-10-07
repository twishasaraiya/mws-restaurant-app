var gulp = require('gulp'),
  // other pulgins
  webp = require('gulp-webp'),
  browserify = require('browserify'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  uglify = require('gulp-uglify'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  log = require('gulplog'),
  bs = require('browser-sync').create(),
  reload = bs.reload,
  clean = require('gulp-clean'),
  runSequence = require('run-sequence'),
  zip = require('gulp-gzip'),
  size = require('gulp-size')
// vinyl => virtual file format for gulp streams

var mainPageFiles = ['src/js/dbhelper.js', 'src/js/main.js']
var restaurantInfoPageFiles = [
  'src/js/dbhelper.js',
  'src/js/restaurant_info.js'
]

/*
* Clean dist folder
*/
gulp.task('clean', () => {
  console.log('Clean dist folder')
  gulp.src(['dist/**/*.*', '!dist']).pipe(clean({ force: true, read: false }))
})
/*
  * Convert Images to Next-Gen format Webp
  */
gulp.task('copy-images', () => {
  gulp
    .src('public/img/*.jpg')
    .pipe(webp())
    .pipe(gulp.dest('dist/img/'))
})

gulp.task('copy-icons', () => {
  gulp.src('public/icons/*.svg').pipe(gulp.dest('dist/icons/'))
})

gulp.task('copy-html', () => {
  gulp
    .src(['index.html', 'offline.html', 'restaurant.html'])
    .pipe(gulp.dest('dist/html/'))
})
/*
* Copy files to dist folder
*/
gulp.task('copy', ['copy-html', 'copy-images', 'copy-icons'])
/*
   * Convert es6 to es2015
   * https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md
   * https://travismaynard.com/writing/using-babel-with-gulp
   */
gulp.task('minify-js', () => {
  mainPageFiles.map(jsfile => {
    return (
      browserify({
        entries: [jsfile]
      })
        .transform('babelify', { presets: ['env'] })
        .bundle()
        .pipe(source('main.bundle.js')) // source works only for one file at a time
        .pipe(buffer()) // convert streaming to buffered vinyl file objects
        .pipe(sourcemaps.init({ loadMaps: true }))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', log.error)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/js/'))
    )
  })

  restaurantInfoPageFiles.map(jsfile => {
    return (
      browserify({
        entries: [jsfile]
      })
        .transform('babelify', { presets: ['env'] })
        .bundle()
        .pipe(source('restaurant.bundle.js')) // source works only for one file at a time
        .pipe(buffer()) // convert streaming to buffered vinyl file objects
        .pipe(sourcemaps.init({ loadMaps: true }))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', log.error)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/js'))
    )
  })
})

/*
   * Minify and autoprefix css
   */
gulp.task('minify-css', () => {
  gulp
    .src('src/css/*.css')
    .pipe(sourcemaps.init())
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions']
      })
    )
    .pipe(
      cleanCSS({
        compatibility: 'ie8'
      })
    )
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css'))
})

/**
 *     Keep Track of files size
 **/
gulp.task('infos', () => {
  console.log('Total size of dist folder ')
  gulp.src('dist/**/*.{js,css}').pipe(size({ pretty: true }))
})
/**
 *       Compress files
 **/
gulp.task('compress', () => {
  gulp
    .src('dist/*')
    .pipe(zip())
    .pipe(gulp.dest('dist/'))
})
/*
   * Watch and rebuild js files
   */

gulp.task('serve', () => {
  bs.init({
    server: './'
  })
  gulp.watch('src/js/*.js', ['minify-js'])
  gulp.watch('src/js/*.js').on('change', reload)
  gulp.watch('src/css/*.css', ['minify-css'])
  gulp.watch('src/css/*.css').on('change', reload)
  bs.stream()
})

gulp.task(
  'default',
  runSequence('clean', 'copy', ['minify-css', 'minify-js'], 'serve')
)

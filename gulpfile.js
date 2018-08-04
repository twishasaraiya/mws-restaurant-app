var gulp = require('gulp');
// other pulgins
var webp = require('gulp-webp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var watch =  require('gulp-watch');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var log=require('gulplog');
// vinyl => virtual file format for gulp streams

var mainPageFiles = ['src/js/dbhelper.js','src/js/main.js'];
var restaurantInfoPageFiles = ['src/js/dbhelper.js','src/js/restaurant_info.js'];

 /*
  * Convert Images to Next-Gen format Webp
  */
gulp.task('images',()=>{
  gulp.src('src/img/*.jpg')
  .pipe(webp())
  .pipe(gulp.dest('img/webp'))
});

  /*
   * Convert es6 to es2015
   * https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md
   * https://travismaynard.com/writing/using-babel-with-gulp
   */
gulp.task('build',()=>{
  mainPageFiles.map((jsfile)=>{
    return browserify({
      entries: [jsfile]
    })
    .transform('babelify',{presets:['env']})
    .bundle()
    .pipe(source('main.bundle.js')) // source works only for one file at a time
    .pipe(buffer()) // convert streaming to buffered vinyl file objects
    .pipe(sourcemaps.init({loadMaps: true}))
    // Add transformation tasks to the pipeline here.
    .pipe(uglify())
    .on('error', log.error)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build/js/'));
  });

    restaurantInfoPageFiles.map((jsfile)=>{
    return browserify({
      entries: [jsfile]
    })
    .transform('babelify',{presets:['env']})
    .bundle()
    .pipe(source('restaurant.bundle.js')) // source works only for one file at a time
    .pipe(buffer()) // convert streaming to buffered vinyl file objects
    .pipe(sourcemaps.init({loadMaps: true}))
    // Add transformation tasks to the pipeline here.
    .pipe(uglify())
    .on('error', log.error)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build/js'));
  });
});

  /*
   * Minify and autoprefix css
   */
gulp.task('styles',()=>{
  gulp.src('src/css/*.css')
  .pipe(sourcemaps.init())
  .pipe(autoprefixer({
    browsers : ['last 2 versions']
  }))
  .pipe(cleanCSS({
    compatibility: 'ie8'
  }))
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('build/css'));
});
  /*
   * Watch and rebuild js files
   */
gulp.task('watch',()=>{
    gulp.watch(jsfiles,['build']);
});

gulp.task('default',['watch']);

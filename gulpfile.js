var gulp = require('gulp');
// other pulgins
var webp = require('gulp-webp');

gulp.task('images',()=>{
  gulp.src('img/*.jpg')
  .pipe(webp())
  .pipe(gulp.dest('img/webp'))
})

gulp.task('default');

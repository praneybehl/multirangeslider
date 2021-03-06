var babel = require('gulp-babel');
var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var derequire = require('gulp-derequire');
var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var livereload = require('gulp-livereload');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

gulp.task('less', function () {
  gulp.src(['dev/multirangeslider.less'])
    .pipe(less())
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
});

var b = browserify({
  entries: './dev/multirangeslider.js',
  standalone: 'multirangeslider'
}).transform(babelify);

var w = watchify(b);

var watch_bundle = function () {
  w.bundle()
    .on("error", function (error) {
      gutil.log(error.message);
      gutil.beep();
      this.emit('end');
    })
    .pipe(source('multirangeslider.js'))
    .pipe(derequire())
    .pipe(gulp.dest('./dist/'))
    .pipe(livereload())
};

w.on('update', watch_bundle);
w.on('time', function (time) {
  gutil.log("browserify", time, 'ms');
});


gulp.task('build:js', function () {
  var b = browserify({
    entries: './dev/multirangeslider.js',
    standalone: 'multirangeslider'
  });

  return b
    .transform(babelify)
    .bundle()
    .pipe(source('multirangeslider.js'))
    .pipe(derequire())
    .pipe(gulp.dest('dist'))

    .pipe(rename('multirangeslider.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
  livereload.listen({start: true});
  gulp.watch(['dev/*.less'], ['less']);
  gulp.watch(['test/test.js'], function () {
    livereload.reload();
  });
  watch_bundle();
});

gulp.task('build', ['less', 'build:js']);
gulp.task('default', ['watch', 'build']);

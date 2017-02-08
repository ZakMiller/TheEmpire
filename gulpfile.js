const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const browserify = require('browserify')
const babel = require('babelify')
const nodemon = require('gulp-nodemon')

// Gulp Tasks
gulp.task('build', build)
gulp.task('watch', ['build'], watch)

gulp.task('default', ['watch'])

const globsToBuild = [
  'public/scripts/*.js'
]

function build() {
  browserify({
    entries: ['public/scripts/main.js'],
    debug: true,
    extensions: ['js']
  })
    .transform(babel, {
      presets: ['es2015']
    })
    .bundle()
    .on('error', err => {
      console.error(err.stack)
      console.error('\nScroll up and fix your errors!')
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public'))
}

function watch() {
  // restart Node.js server on backend changes
  nodemon({
    script: 'server.js',
    watch: ['*.js'],
    ext: 'js',
    ignore: ['gulpfile.js', 'public/']
  })

  // re-transpile and rebundle scripts on frontend changes
  gulp.watch(globsToBuild, ['build'])
}

const {src, dest, series, watch, parallel} = require('gulp')
const scss = require('gulp-sass')(require('sass'))
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat')
const connect = require('gulp-connect');
const favicons = require('gulp-favicons');
const fileinclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');

const appPath = {
    scss: './app/scss/style.scss',
    // css: './app/scss/*.scss',
    js: './app/js/*.js',
    img: [
        './app/img/**/*.jpg',
        './app/img/**/*.png',
        './app/img/**/*.svg',
    ]
}
const destPath = {
    root: './dist',
    css: './dist/css/',
    js: './dist/js/',
    img: './dist/img/'
}

const jsPath = [
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/slick-slider/slick/slick.min.js',
    // './node_modules/jquery-validation/dist/jquery.validate.min.js',
    // './node_modules/bootstrap/dist/js/bootstrap.min.js',
    // './node_modules/smoothscroll-polyfill/dist/smoothscroll.min.js',
    './app/js/script.js'
]


function imageMin() {
    return src(appPath.img)
        .pipe(imagemin())
        .pipe(dest(destPath.img))
        .pipe(connect.reload())
}

// feature scss
function scssCompress() {
    return src(appPath.scss)
        .pipe(sourcemaps.init())
        .pipe(scss({
            outputStyle: 'compressed'
        }))
        .pipe(sourcemaps.write())
        .pipe(dest(destPath.css))
        .pipe(connect.reload())
}

function copyHtml() {
    return src('./app/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(dest(destPath.root))
        .pipe(connect.reload())
}

function copyFont() {
    return src('./app/fonts/*.*')
        .pipe(dest('./dist/fonts'))
        .pipe(connect.reload())
}

function jsMin() {
    return src(jsPath)
        .pipe(sourcemaps.init())
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(dest(destPath.js))
        .pipe(connect.reload());

}

// function cssMin() {
//     return src(appPath.css)
//         .pipe(cssmin())
//         .pipe(dest(destPath.css))
//         .pipe(connect.reload())
// }

function server() {
    connect.server({
        name: 'Dev App',
        root: 'dist',
        port: 8080,
        livereload: true
    })
}

function makeFavicon() {
    return src('./app/img/favicon.png')
        .pipe(
            favicons({
                appName: 'Dev App',
                appShortName: 'App',
                appDescription: 'This is my application',
                developerName: 'Hayden Bleasel',
                developerURL: 'http://haydenbleasel.com/',
                background: '#020307',
                path: 'favicons/',
                url: 'http://haydenbleasel.com/',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/?homescreen=1',
                version: 1.0,
                logging: false,
                html: 'index.html',
                pipeHTML: true,
                replace: true,
            })
        )
        .pipe(dest('./dist/favicons/'));
}


function watchCode() {
    watch('app/**/*.html', copyHtml);
    watch('app/scss/**/*.scss', scssCompress);
    // watch(appPath.css, cssMin);
    watch(appPath.js, jsMin);
    watch(appPath.img, {events: 'add'}, imageMin);
}

exports.build = series(copyHtml, imageMin, jsMin, scssCompress, copyFont, makeFavicon)
exports.default = series(copyHtml, imageMin, jsMin, scssCompress, copyFont, parallel(server, watchCode))

const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browsersync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del')

function browserSync () {
    browsersync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function cleanDist() {
    return del('dist')
}

function scripts () {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/swiper/swiper-bundle.min.js',
        'app/js/index.js'
    ])
    .pipe(concat('index.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browsersync.stream())
}

function images () {
    return src('app/images/**/*')
        .pipe(imagemin(
            [	
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}




function styles () {
    return src([
        'node_modules/swiper/swiper.scss',
        'app/scss/style.scss',
    ])
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browsersync.stream())
}


function build () {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/index.min.js',
        'app/*.html'
    ], {base: 'app'} ) 
    .pipe(dest('dist'));
}





function watching () {
    watch(['app/scss/**/*.scss'], styles)
    watch(['app/js/**/*.js','!app/js/index.min.js'], scripts)
    watch(['app/*.html']).on('change', browsersync.reload);
}


exports.styles = styles;
exports.watching = watching;
exports.browserSync = browserSync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;


exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browserSync, watching);
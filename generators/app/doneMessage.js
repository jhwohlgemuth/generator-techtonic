
const { isBoolean } = require('lodash');
const chalk = require('chalk');
const { blue, green, magenta, red, white, yellow, bold, dim } = require('chalk');
const { maybe } = require('./utils');

module.exports = function (generator) {
    const LETS_GET_STARTED = 'npm start';
    const ELECTRON_TAGLINE = '⚡ Powered by Electron! ';
    const JEST_TAGLINE = ' Delightful testing provided by Jest ;) ';
    const RUST_WARNING = '=> make sure rustc and wasm-gc are installed';
    const RUST_TAGLINE = ' WebAssembly ❤ Rust ';
    const { config } = generator;
    const {
        projectName,
        useAmd,
        useHandlebars,
        useImagemin,
        useJest,
        useLess,
        useRust,
        useSass,
        useWebpack
    } = config.getAll();
    const isNative = config.get('isNative');
    const isWebapp = config.get('isWebapp');
    const isApplication = isNative || isWebapp;
    const isNativeWebapp = isNative && isWebapp;
    const type = isApplication ? 'Application' : 'Project';

    const less = chalk.blue('Less');
    const lodash = blue('Lodash');
    const sass = magenta('Sass'); //chalk.hex('#CC6699')('Sass');
    const browserify = yellow('Browserify'); //chalk.hex('#3C6991')('Browserify')
    const handlebars = yellow('Handlebars'); //chalk.hex('#ED8623')('Handlebars');
    const rjs = red('r.js');
    const webpack = blue('Webpack');

    return [].concat('', `${type} Name:  ${bold.inverse(spaceWrap(projectName))}`, maybe(isWebapp, ''), maybe(isNativeWebapp, 'Renderer:', maybe(isWebapp, 'Webapp:')), maybe(isWebapp, [`Script Bundler:    ${bold(maybe(useAmd, rjs, maybe(useWebpack, webpack, browserify)))}`, `CSS pre-processor: ${bold(maybe(useLess, less, maybe(useSass, sass, dim('None'))))}`, `Template renderer: ${bold(maybe(useHandlebars, handlebars, lodash))}`].map(yes).map(str => `  ${str}`)), '', maybe(isWebapp, [yesNo(useImagemin)('Compress production images with imagemin')]), maybe(isNative, ['', yellow.bgBlack.bold(ELECTRON_TAGLINE)]), maybe(useJest, ['', white.bgMagenta.bold(JEST_TAGLINE)]), maybe(useRust, ['', `${white.bgRed.bold(RUST_TAGLINE)}\n${dim(RUST_WARNING)}`]), '', green.bold('All done!'), maybe(isApplication, white('Try out your shiny new app by running ') + white.bgBlack(spaceWrap(LETS_GET_STARTED))), '').join('\n');
};
function yes(str) {
    return bold(green('✔ ') + white(str));
}
function no(str) {
    return bold.gray(`✗ ${str}`);
}
function yesNo(val) {
    return isBoolean(val) && val ? yes : no;
}
function spaceWrap(str) {
    return ` ${str} `;
}
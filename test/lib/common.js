
const _ = require('lodash');
const {
    file,
    fileContent,
    noFile,
    noFileContent
} = require('yeoman-assert');

const browserifyContent = [
    ['package.json', '"browser":'],
    ['package.json', '"browserify":'],
    ['package.json', '"aliasify":'],
    ['Gruntfile.js', 'browserify'],
    ['Gruntfile.js', 'uglify:']
];

const verifyLessConfigured = _.partial(verifyPreprocessorConfigured, 'less');
const verifySassConfigured = _.partial(verifyPreprocessorConfigured, 'sass');

module.exports = {
    verifyAmdFiles,
    verifyCoreFiles,
    verifyNativeFiles,
    verifyBoilerplateFiles,
    verifyDefaultConfiguration,
    verifyNativeConfiguration,
    verifyDefaultTasksConfiguration,
    verifySassConfigured
};

function verifyAmdFiles() {
    [
        'app/config.js',
        'assets/workers/example.webworker.amd.js'
    ].forEach(name => file(name));
    noFile('assets/workers/example.webworker.js');
    fileContent('config/.eslintrc.js', 'amd: true,');
    fileContent('config/.eslintrc.js', 'commonjs: false,');
}
function verifyCoreFiles() {
    const ALWAYS_INCLUDED = [
        'README.md',
        'Gruntfile.js',
        'config/default.json',
        'config/stylelint.config.js',
        'tasks/webapp.js'
    ];
    ALWAYS_INCLUDED.forEach(name => file(name));
}
function verifyNativeFiles(isWebapp) {
    const ALWAYS_INCLUDED = [
        'bin/preload.js',
        'index.js',
        isWebapp ? 'renderer/app/index.html' : 'renderer/index.html'
    ];
    ALWAYS_INCLUDED.forEach(name => file(name));
}
function verifyBoilerplateFiles(sourceDirectory) {
    [
        'app/index.html',
        'app/app.js',
        'app/main.js',
        'app/router.js',
        'assets/images/logo.png',
        'app/helpers/jquery.extensions.js',
        'app/plugins/radio.logging.js',
        'app/plugins/redux.state.js',
        'app/shims/mn.morphdom.renderer.shim.js'
    ]
        .map(fileName => sourceDirectory + fileName)
        .forEach(name => file(name));
}
function verifyDefaultConfiguration(sourceDirectory) {
    verifyCoreFiles();
    verifyLessConfigured(sourceDirectory);
    fileContent('Gruntfile.js', 'imagemin: ');
    noFileContent(browserifyContent); // script bundler
    noFileContent('Gruntfile.js', 'jst'); // template technology
    fileContent('Gruntfile.js', 'handlebars');// template technology
}
function verifyNativeConfiguration(isWebapp) {
    const startScript = isWebapp ? '"grunt compile && electron index"' : '"electron index"';
    fileContent('package.json', `"start": ${startScript}`);
}
function verifyDefaultTasksConfiguration() {
    const defaultTaskConfigs = [
        ['Gruntfile.js', 'browserSync: {'],
        ['Gruntfile.js', 'clean: {'],
        ['Gruntfile.js', 'jsdoc: {'],
        ['Gruntfile.js', 'jsonlint: {'],
        ['Gruntfile.js', 'karma: {'],
        ['Gruntfile.js', 'open: {'],
        ['Gruntfile.js', 'requirejs: {'],
        ['Gruntfile.js', 'options: { spawn: false }'], // watch task
        ['Gruntfile.js', 'configFile: \'<%= files.config.eslint %>\''], // eslint task
        ['Gruntfile.js', 'eslint: require(config.files.config.eslint)']// plato task
    ];
    fileContent(defaultTaskConfigs);
}
function verifyPreprocessorConfigured(type, sourceDirectory) {
    const EXT_LOOKUP = {
        less: 'less',
        sass: 'scss'
    };
    const ext = EXT_LOOKUP[type];
    const notType = _(EXT_LOOKUP)
        .omit(type)
        .keys()
        .head();
    const notExt = EXT_LOOKUP[notType];
    const customPath = sourceDirectory || '';
    fileContent('Gruntfile.js', 'postcss: ');
    noFile(`${customPath}assets/${type}/reset.${ext}`);
    file(`${customPath}assets/${type}/style.${ext}`);
    fileContent('Gruntfile.js', `${type}: `);
    noFile(`${customPath}assets/${notType}/style.${notExt}`);
    noFileContent('Gruntfile.js', `${notType}: `);
}

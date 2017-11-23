'use strict';

const config = require('config').get('grunt');
const scripts = config.folders.app + '/' + config.files.scripts;// app source
const templates = config.folders.assets + '/' + config.files.templates;// templates
const specs = config.folders.test + '/' + config.folders.specs + '/**/*.js';// test files
module.exports = function(karmaConfig) {
    karmaConfig.set({
        basePath: '../',
        frameworks: ['requirejs', 'mocha', 'chai', 'sinon'],
        files: [
            {pattern: config.folders.test + '/config.js'},
            {pattern: scripts, included: false},// JS scripts
            {pattern: templates, included: false},// HTML templates
            {pattern: specs, included: false},// Mocha specs
            {pattern: config.folders.test + '/data/plugins/*.js', included: false},// Data modules
            {pattern: 'node_modules/sinon/pkg/sinon.js', included: false},// SinonJS
            {pattern: 'node_modules/chai/chai.js', included: false},// Chai
            {pattern: 'node_modules/jquery/dist/jquery.js', included: false},// jQuery
            {pattern: 'node_modules/handlebars/dist/handlebars.js', included: false},// Handlebars
            {pattern: 'node_modules/lodash/lodash.min.js', included: false},// Lodash
            {pattern: 'node_modules/morphdom/dist/morphdom-umd.min.js', included: false},// morphdom
            {pattern: 'node_modules/redux/dist/redux.min.js', included: false},// Redux
            {pattern: 'node_modules/backbone/backbone.js', included: false},// Backbone
            {pattern: 'node_modules/backbone.radio/build/backbone.radio.js', included: false},// Backbone.Radio
            {pattern: 'node_modules/backbone.marionette/lib/backbone.marionette.js', included: false}// Marionette
        ],
        exclude: [config.folders.app + '/config.js'],
        preprocessors: {
            [scripts]: ['coverage']
        },
        coverageReporter: {
            dir: config.folders.reports + '/' + config.folders.coverage,
            includeAllSources: true,
            reporters: [
                {type: 'text-summary', subdir: '.', file: 'text-summary.txt'},
                {type: 'html', subdir: 'report-html'},
                {type: 'text-summary'},
                {type: 'lcov', subdir: 'report-lcov'},
                {type: 'cobertura', subdir: '.', file: 'report-cobertura.txt'}// Jenkins compatible
            ]
        },
        colors: true,
        logLevel: 'INFO',// DISABLE, ERROR, WARN, INFO, DEBUG
        captureTimeout: 60000,
        singleRun: true
    });
};

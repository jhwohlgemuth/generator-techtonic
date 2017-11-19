'use strict';

const {merge, mapValues, isBoolean} = require('lodash');
const {join}    = require('path');
const {yellow}  = require('chalk');
const helpers   = require('yeoman-test');
const {file, noFile, fileContent, noFileContent} = require('yeoman-assert');
const Generator = require('yeoman-generator');
const prompts   = require('../generators/app/prompts');
const {
    verifyCoreFiles,
    verifyBoilerplateFiles,
    verifyDefaultConfiguration,
    verifyDefaultTasksConfiguration,
    verifySassConfigured
} = require('./lib/common');

const ALL_TRUE = merge({}, prompts.project.defaults, prompts.webapp.defaults);
const ALL_FALSE = mapValues(ALL_TRUE, option => isBoolean(option) ? false : option);
const SKIP_INSTALL = {skipInstall: true};
const browserifyContent = [
    ['package.json', '"browser":'],
    ['package.json', '"browserify":'],
    ['package.json', '"aliasify":'],
    ['Gruntfile.js', 'browserify'],
    ['Gruntfile.js', 'uglify:']
];
const ariaContent = [
    ['Gruntfile.js', 'a11y: '],
    ['Gruntfile.js', 'accessibility: '],
    ['Gruntfile.js', 'aria-audit']
];

describe('Default generator', function() {
    let stub;
    beforeEach(() => {
        stub = jest.spyOn(Generator.prototype.user.git, 'name').mockReturnValue(null);
    });
    afterEach(() => {
        stub.mockRestore();
    });
    describe('can create and configure files with prompt choices', () => {
        const verify = () => {
            verifyCoreFiles();
            verifyBoilerplateFiles('./');
        };
        it('all prompts FALSE (default configuration)', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(ALL_FALSE)
            .toPromise()
            .then(() => {
                verify();
                noFileContent(browserifyContent);
                noFileContent(ariaContent);
                noFileContent('Gruntfile.js', 'imagemin: ');
                fileContent('config/.eslintrc.js', 'amd: true,');
                fileContent('config/.eslintrc.js', 'backbone/defaults-on-top');
            }));
        it('all prompts TRUE (default configuration)', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(ALL_TRUE)
            .toPromise()
            .then(() => {
                verifyBoilerplateFiles('./');
                verifyDefaultConfiguration();
                verifyDefaultTasksConfiguration();
                file('app/helpers/handlebars.helpers.js')
                fileContent('config/.eslintrc.js', 'es6: true,');
                fileContent('config/.eslintrc.js', 'backbone/defaults-on-top');
            }));
        it('all prompts TRUE (--browserify)', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {browserify: true}))
            .withPrompts(ALL_TRUE)
            .toPromise()
            .then(() => {
                verify();
                fileContent(browserifyContent);
                fileContent(ariaContent);
                fileContent('Gruntfile.js', 'imagemin: ');

            }));
        it('all prompts TRUE (--css-preprocessor sass)', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {cssPreprocessor: 'sass'}))
            .withPrompts(ALL_TRUE)
            .toPromise()
            .then(verify));
        it('all prompts TRUE (--template-technology lodash)', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {templateTechnology: 'lodash'}))
            .withPrompts(ALL_TRUE)
            .toPromise()
            .then(() => {
                verify();
                fileContent('Gruntfile.js', 'jst');
                noFileContent('Gruntfile.js', 'handlebars');
                noFile('app/helpers/handlebars.helpers.js')
            }));
        it('all prompts TRUE (--skip-aria)', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {'skip-aria': true}))
            .withPrompts(ALL_TRUE)
            .toPromise()
            .then(() => {
                verify();
                noFileContent(ariaContent);
                fileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('all prompts TRUE (--skip-imagemin)', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {'skip-imagemin': true}))
            .withPrompts(ALL_TRUE)
            .toPromise()
            .then(() => {
                verify();
                fileContent(ariaContent);
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('only aria prompt FALSE', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge({}, ALL_TRUE, {aria: false}))
            .toPromise()
            .then(() => {
                verify();
                noFileContent(ariaContent);
            }));
        it('only imagemin prompt FALSE', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge({}, ALL_TRUE, {imagemin: false}))
            .toPromise()
            .then(() => {
                verify();
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('select browserify via prompt', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge({}, ALL_TRUE, {moduleData: `CommonJS with ${yellow('Browserify')}`}))
            .toPromise()
            .then(() => {
                verify();
                fileContent(browserifyContent);
                fileContent(ariaContent);
                fileContent('Gruntfile.js', 'imagemin: ');

            }));
        it('select sass via prompt', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge({}, ALL_TRUE, {cssPreprocessor: 'sass'}))
            .toPromise()
            .then(verify));
        it('select no CSS pre-processor via prompt', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge({}, ALL_TRUE, {cssPreprocessor: 'none'}))
            .toPromise()
            .then(() => {
                verify();
                noFile('assets/css/reset.css');
                noFile('assets/less/style.less');
                noFile('assets/sass/style.scss');
                noFileContent('Gruntfile.js', 'sass: ');
                noFileContent('Gruntfile.js', 'less: ');
            }));
    });
    describe('can create and configure files with with command line options', () => {
        const defaults = true;
        const verify = () => {
            verifyCoreFiles();
            verifyBoilerplateFiles('./');
        };
        it('--defaults', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {defaults}))
            .toPromise()
            .then(() => {
                verifyBoilerplateFiles('./');
                verifyDefaultConfiguration();
            }));
        it('--defaults --browserify', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {defaults}, {browserify: true}))
            .toPromise()
            .then(() => {
                verify();
                fileContent(browserifyContent);
            }));
        it('--defaults --css-preprocessor sass', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {defaults}, {cssPreprocessor: 'sass'}))
            .toPromise()
            .then(verify));
        it('--defaults --css-preprocessor none', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {defaults}, {cssPreprocessor: 'none'}))
            .toPromise()
            .then(() => {
                verify();
                noFile('assets/css/reset.css');
                noFile('assets/less/style.less');
                noFile('assets/sass/style.scss');
                noFileContent('Gruntfile.js', 'sass: ');
                noFileContent('Gruntfile.js', 'less: ');
            }));
        it('--defaults --template-technology lodash', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {defaults}, {templateTechnology: 'lodash'}))
            .toPromise()
            .then(() => {
                verify();
                fileContent('Gruntfile.js', 'jst');
                noFileContent('Gruntfile.js', 'handlebars');
            }));
        it('--defaults --skip-aria --skip-imagemin', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {
                defaults: true,
                'skip-aria': true,
                'skip-imagemin': true}))
            .toPromise()
            .then(() => {
                verify();
                noFileContent(ariaContent);
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('--defaults --skip-aria --skip-imagemin --browserify', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {
                defaults: true,
                'skip-aria': true,
                'skip-imagemin': true,
                browserify: true}))
            .toPromise()
            .then(() => {
                verify();
                fileContent(browserifyContent);
                noFileContent(ariaContent);
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('--defaults --browserify --css-preprocessor sass --template-technology lodash', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {
                defaults: true,
                browserify: true,
                cssPreprocessor: 'sass',
                templateTechnology: 'lodash'}))
            .toPromise()
            .then(() => {
                verify();
                verifySassConfigured();
                fileContent(browserifyContent);
                fileContent('Gruntfile.js', 'jst');
                noFileContent('Gruntfile.js', 'handlebars');
                fileContent(ariaContent);
                fileContent('Gruntfile.js', 'imagemin: ');
            }));
    });
});
describe('Default generator (with custom source directory)', function() {
    let stub;
    const sourceDirectory = 'webapp/';
    const verify = () => {
        verifyCoreFiles();
        verifyBoilerplateFiles(sourceDirectory);
    };
    describe('can create and configure files with prompt choices', () => {
        beforeAll(() => {
            stub = jest.spyOn(Generator.prototype.user.git, 'name').mockReturnValue(null);
        });
        afterAll(() => {
            stub.mockRestore();
        });
        it('all prompts TRUE', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge(ALL_TRUE, {sourceDirectory}))
            .toPromise()
            .then(() => {
                verifyBoilerplateFiles(sourceDirectory);
                verifyDefaultConfiguration(sourceDirectory);
            }));
        it('all prompts FALSE', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge(ALL_FALSE, {sourceDirectory}))
            .toPromise()
            .then(() => {
                verify();
                noFileContent(browserifyContent);
                noFileContent(ariaContent);
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('only aria prompt FALSE', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge({}, ALL_TRUE, {sourceDirectory, aria: false}))
            .toPromise()
            .then(() => {
                verify();
                noFileContent(browserifyContent);
                noFileContent(ariaContent);
                fileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('only imagemin prompt FALSE', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge({}, ALL_TRUE, {sourceDirectory, imagemin: false}))
            .toPromise()
            .then(() => {
                verify();
                noFileContent(browserifyContent);
                fileContent(ariaContent);
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
    });
});

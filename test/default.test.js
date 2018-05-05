/* eslint-disable promise/always-return */
const {merge, mapValues, isBoolean} = require('lodash');
const {join}    = require('path');
const {blue, yellow}  = require('chalk');
const helpers   = require('yeoman-test');
const {file, noFile, fileContent, noFileContent} = require('yeoman-assert');
const Generator = require('yeoman-generator');
const prompts   = require('../generators/app/prompts');
const {
    verifyAmdFiles,
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
    ['Gruntfile.js', 'browserify']
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
                verifyAmdFiles(),
                noFileContent(browserifyContent);
                noFileContent('Gruntfile.js', 'imagemin: ');
                noFileContent('Gruntfile.js', 'webpack: ');
                fileContent('config/.eslintrc.js', 'amd: true,');
                fileContent('config/.eslintrc.js', 'backbone/defaults-on-top');
            }));
        it('all prompts TRUE (default configuration)', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(ALL_TRUE)
            .toPromise()
            .then(() => {
                verifyAmdFiles(),
                verifyBoilerplateFiles('./');
                verifyDefaultConfiguration();
                verifyDefaultTasksConfiguration();
                file('app/helpers/handlebars.helpers.js');
                fileContent('config/.eslintrc.js', 'es6: true,');
                fileContent('config/.eslintrc.js', 'backbone/defaults-on-top');
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
                noFile('app/helpers/handlebars.helpers.js');
            }));
        it('all prompts TRUE (--skip-imagemin)', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {'skip-imagemin': true}))
            .withPrompts(ALL_TRUE)
            .toPromise()
            .then(() => {
                verify();
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('only imagemin prompt FALSE', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge({}, ALL_TRUE, {imagemin: false}))
            .toPromise()
            .then(() => {
                verify();
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('select Browserify via prompt', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge({}, ALL_TRUE, {moduleData: `CommonJS with ${yellow('Browserify')}`}))
            .toPromise()
            .then(() => {
                verify();
                fileContent(browserifyContent);
                fileContent('Gruntfile.js', 'imagemin: ');
                fileContent('Gruntfile.js', 'uglify: ');
                fileContent('config/.eslintrc.js', 'amd: false,');
                fileContent('config/.eslintrc.js', 'commonjs: true,');
            }));
        it('select Webpack via prompt', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge({}, ALL_TRUE, {moduleData: `CommonJS with ${blue('Webpack')}`}))
            .toPromise()
            .then(() => {
                verify();
                noFile('test/config.js');
                noFileContent(browserifyContent);
                fileContent('package.json', '"testMatch":');
                fileContent('package.json', '"test": "jest ');
                file('config/webpack.config.js');
                fileContent('Gruntfile.js', 'imagemin: ');
                fileContent('Gruntfile.js', 'webpack: ');
                fileContent('Gruntfile.js', 'uglify: ');
                fileContent('config/.eslintrc.js', 'amd: false,');
                fileContent('config/.eslintrc.js', 'commonjs: true,');
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
        it('--defaults --slim', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {defaults, slim: true}))
            .toPromise()
            .then(() => {
                verify();
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('--defaults --use-rust', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {defaults, 'use-rust': true}))
            .toPromise()
            .then(() => {
                verify();
                fileContent('package.json', '"build:wasm": ');
                fileContent('package.json', '"postbuild:wasm": ');
                file('app/helpers/importWasm.js');
                file('assets/rust/main.rs');
                file('assets/rust/counter.rs');
            }));
        it('--defaults --use-jest', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {defaults, 'use-jest': true}))
            .toPromise()
            .then(() => {
                verify();
                fileContent(browserifyContent);
                fileContent('package.json', '"testMatch":');
                fileContent('package.json', '"test": "jest ');
                file('assets/workers/example.webworker.js');
                file('test/example.test.js');
                noFile('test/mocha.opts');
            }));
        it('--defaults --use-browserify', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {defaults}, {'use-browserify': true}))
            .toPromise()
            .then(() => {
                verify();
                fileContent(browserifyContent);
                noFile('config/webpack.config.js');
                noFileContent('Gruntfile.js', 'webpack: ');
            }));
        it('--defaults --use-webpack', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {defaults}, {'use-webpack': true}))
            .toPromise()
            .then(() => {
                verify();
                file('config/webpack.config.js');
                file('assets/workers/example.webworker.js');
                fileContent('package.json', 'webpack-dashboard -- webpack-dev-server --config');
                fileContent('Gruntfile.js', 'webpack: ');
                fileContent('Gruntfile.js', 'uglify: ');
                noFileContent(browserifyContent);
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
        it('--defaults --skip-imagemin', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {
                defaults: true,
                'skip-imagemin': true}))
            .toPromise()
            .then(() => {
                verify();
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('--defaults --skip-imagemin --use-browserify', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {
                defaults: true,
                'skip-imagemin': true,
                'use-browserify': true}))
            .toPromise()
            .then(() => {
                verify();
                fileContent(browserifyContent);
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('--defaults --use-browserify --css-preprocessor sass --template-technology lodash', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {
                defaults: true,
                'use-browserify': true,
                cssPreprocessor: 'sass',
                templateTechnology: 'lodash'}))
            .toPromise()
            .then(() => {
                verify();
                verifySassConfigured();
                fileContent(browserifyContent);
                fileContent('Gruntfile.js', 'jst');
                noFileContent('Gruntfile.js', 'handlebars');
                fileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('--defaults --src boot', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(merge({}, SKIP_INSTALL, {
                defaults: true,
                src: 'boot'}))
            .toPromise()
            .then(() => {
                verifyCoreFiles();
                verifyBoilerplateFiles('boot/');
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
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
        it('only imagemin prompt FALSE', () => helpers.run(join(__dirname, '../generators/app'))
            .withOptions(SKIP_INSTALL)
            .withPrompts(merge({}, ALL_TRUE, {sourceDirectory, imagemin: false}))
            .toPromise()
            .then(() => {
                verify();
                noFileContent(browserifyContent);
                noFileContent('Gruntfile.js', 'imagemin: ');
            }));
    });
});

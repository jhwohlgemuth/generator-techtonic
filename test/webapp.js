'use strict';

var path    = require('path');
var _       = require('underscore');
var sinon   = require('sinon');
var helpers = require('yeoman-test');
var assert  = require('yeoman-assert');
var base    = require('yeoman-generator').generators.Base;

var prompts = require('../generators/app/prompts');

function createProject() {
    return helpers.run(path.join(__dirname, '../generators/project'))
        .withOptions({skipInstall: true})
        .withPrompts(prompts.project.defaults)
        .toPromise();
}
function verifyCoreFiles() {
    var ALWAYS_INCLUDED = [
        'README.md',
        'config/.csslintrc',
        'tasks/build.js',
        'tasks/app.js'
    ];
    ALWAYS_INCLUDED.forEach(file => assert.file(file));
}
function verifyBoilerplateFiles(appDir) {
    var files = [
        'app/index.html',
        'app/app.js',
        'app/main.js',
        'app/config.js',
        'app/router.js',
        'assets/images/logo.png',
        'app/controllers/example.webworker.js'
    ];
    files
        .map(function(fileName) {return appDir + fileName;})
        .forEach(file => assert.file(file));
}

describe('Webapp generator', function() {
    this.timeout(800);
    var stub;
    var SKIP_INSTALL = {skipInstall: true};
    before(function() {
        stub = sinon.stub(base.prototype.user.git, 'name');
        stub.returns(null);
    });
    after(function() {
        stub.restore();
    });
    it('can create and configure files with default prompt choices', function() {
        return helpers.run(path.join(__dirname, '../generators/webapp'))
            .inTmpDir(createProject)
            .withOptions(SKIP_INSTALL)
            .withPrompts(prompts.webapp.defaults)
            .toPromise()
            .then(function() {
                verifyCoreFiles();
                verifyBoilerplateFiles('./');
                assert.fileContent('Gruntfile.js', 'a11y: ');
                assert.fileContent('Gruntfile.js', 'accessibility: ');
                assert.fileContent('Gruntfile.js', 'aria-audit');
                assert.fileContent('Gruntfile.js', 'imagemin: ');
            });
    });
});
describe('Default generator', function() {
    this.timeout(800);
    var stub;
    var SKIP_INSTALL = {skipInstall: true};
    var ALL_TRUE = _.extend({}, prompts.project.defaults, prompts.webapp.defaults);
    var ALL_FALSE = _.mapObject(ALL_TRUE, function(option) {return _.isBoolean(option) ? false : option;});
    describe('can create and configure files with prompt choices', function() {
        before(function() {
            stub = sinon.stub(base.prototype.user.git, 'name');
            stub.returns(null);
        });
        after(function() {
            stub.restore();
        });
        it('all prompts TRUE', function() {
            return helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions(SKIP_INSTALL)
                .withPrompts(ALL_TRUE)
                .toPromise()
                .then(function() {
                    verifyCoreFiles();
                    verifyBoilerplateFiles('./');
                    assert.fileContent('Gruntfile.js', 'a11y: ');
                    assert.fileContent('Gruntfile.js', 'accessibility: ');
                    assert.fileContent('Gruntfile.js', 'aria-audit');
                    assert.fileContent('Gruntfile.js', 'imagemin: ');
                });
        });
        it('all prompts FALSE', function() {
            return helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions(SKIP_INSTALL)
                .withPrompts(ALL_FALSE)
                .toPromise()
                .then(function() {
                    verifyCoreFiles();
                    verifyBoilerplateFiles('./');
                    assert.noFileContent('Gruntfile.js', 'a11y: ');
                    assert.noFileContent('Gruntfile.js', 'accessibility: ');
                    assert.noFileContent('Gruntfile.js', 'aria-audit');
                    assert.noFileContent('Gruntfile.js', 'imagemin: ');
                });
        });
        it('all prompts TRUE (with custom source directory)', function() {
            return helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions(SKIP_INSTALL)
                .withPrompts(_.extend(ALL_TRUE, {appDir: 'webapp/'}))
                .toPromise()
                .then(function() {
                    verifyCoreFiles();
                    verifyBoilerplateFiles('webapp/');
                    assert.fileContent('Gruntfile.js', 'a11y: ');
                    assert.fileContent('Gruntfile.js', 'accessibility: ');
                    assert.fileContent('Gruntfile.js', 'aria-audit');
                    assert.fileContent('Gruntfile.js', 'imagemin: ');
                });
        });
        it('all prompts FALSE (with custom source directory)', function() {
            return helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions(SKIP_INSTALL)
                .withPrompts(_.extend(ALL_FALSE, {appDir: 'webapp/'}))
                .toPromise()
                .then(function() {
                    verifyCoreFiles();
                    verifyBoilerplateFiles('webapp/');
                    assert.noFileContent('Gruntfile.js', 'a11y: ');
                    assert.noFileContent('Gruntfile.js', 'accessibility: ');
                    assert.noFileContent('Gruntfile.js', 'aria-audit');
                    assert.noFileContent('Gruntfile.js', 'imagemin: ');
                });
        });
    });
});


const {join}     = require('path');
const {copySync} = require('fs-extra');
const helpers    = require('yeoman-test');
const Generator  = require('yeoman-generator');
const {defaults} = require('../generators/app/prompts').webapp;
const {
    verifyBoilerplateFiles,
    verifyDefaultConfiguration
} = require('./lib/common');

describe('Webapp generator', () => {
    let stub;
    const projectName = 'omaha-project';
    const sourceDirectory = './';
    const verify = () => {
        verifyBoilerplateFiles(sourceDirectory);
        verifyDefaultConfiguration(sourceDirectory);
    };
    beforeAll(() => {
        stub = jest.spyOn(Generator.prototype.user.git, 'name').mockReturnValue(null);
    });
    afterAll(() => {
        stub.mockRestore();
    });
    it('can create and configure files with default prompt choices', () => helpers.run(join(__dirname, '../generators/webapp'))
        .inTmpDir(dir => {
            const projectTemplatesDirectory = '../generators/project/templates/';
            ['_README.md', '_Gruntfile.js', '_package.json'].forEach(function(file) {
                copySync(
                    join(__dirname, `${projectTemplatesDirectory}${file}`),
                    join(dir, file.split('_')[1])
                );
            });
            copySync(
                join(__dirname, `${projectTemplatesDirectory}config/_default.json`),
                join(dir, 'config', 'default.json')
            );
        })
        .withOptions({skipInstall: true})
        .withPrompts(defaults)
        .withLocalConfig({projectName, sourceDirectory})
        .toPromise()
        .then(verify));
});
describe('Webapp generator (custom source directory)', () => {
    let stub;
    const projectName = 'omaha-project';
    const sourceDirectory = './src';
    const verify = () => {
        verifyBoilerplateFiles(sourceDirectory);
        verifyDefaultConfiguration(sourceDirectory);
    };
    beforeAll(() => {
        stub = jest.spyOn(Generator.prototype.user.git, 'name').mockReturnValue(null);
    });
    afterAll(() => {
        stub.mockRestore();
    });
    it('can create and configure files with default prompt choices', () => helpers.run(join(__dirname, '../generators/webapp'))
        .inTmpDir(dir => {
            const projectTemplatesDirectory = '../generators/project/templates/';
            ['_README.md', '_Gruntfile.js', '_package.json'].forEach(function(file) {
                copySync(
                    join(__dirname, `${projectTemplatesDirectory}${file}`),
                    join(dir, file.split('_')[1])
                );
            });
            copySync(
                join(__dirname, `${projectTemplatesDirectory}config/_default.json`),
                join(dir, 'config', 'default.json')
            );
        })
        .withOptions({skipInstall: true})
        .withPrompts(defaults)
        .withLocalConfig({projectName, sourceDirectory})
        .toPromise()
        .then(verify));
});

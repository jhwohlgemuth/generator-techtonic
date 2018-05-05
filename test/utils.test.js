const {last}       = require('lodash');
const {join}       = require('path');
const {unlinkSync} = require('fs');
const {
    getModuleFormat,
    getProjectVariables,
    getSourceDirectory,
    json,
    maybeInclude,
    parseModuleData,
    resolveCssPreprocessor,
    shouldUseBrowserify
} = require('../generators/app/utils');
const {
    fin,
    fail,
    download,
    formatFederalAgencyData
} = require('../generators/app/data-utils');

const ORIGINAL_CONSOLE_LOG = window.console.log;
const TEST_JSON_DATA = require('./data/test.json');

beforeAll(() => {
    window.console.log = jest.fn().mockName('Console Log');
});
afterAll(() => {
    window.console.log.mock.mockReset();
    window.console.log = ORIGINAL_CONSOLE_LOG;
});
describe('Data Utilities', () => {
    it('can log failure message for invalid url', () => {
        const url = 'not a valid url';
        const path = url;
        download({url, path});
    });
    it('can format federal agency JSON data', () => {
        const results = formatFederalAgencyData(TEST_JSON_DATA);
        expect(results).toMatchSnapshot();
    });
    it('can log success and fail messages via promise chain', () => {
        const path = 'some-path-name.json';
        expect(fin(path)([1, 2, 3])).toMatchSnapshot();
        expect(fail(path)([3, 2, 1])).toMatchSnapshot();
    });
});
describe('Generator Utilities', () => {
    it('can parse module data string', () => {
        expect(
            [
                'AMD with \u001b[31mr.js\u001b[39m',
                'AMD with \u001b[33mbrowserify\u001b[39m',
                'CJS with \u001b[33mbrowserify\u001b[39m',
                'CJS with \u001b[34mwebpack\u001b[39m'
            ].map(parseModuleData).map(last)
        ).toEqual([
            'rjs',
            'browserify',
            'browserify',
            'webpack'
        ]);
    });
    it('can optionally return values', () => {
        const result = [].concat(
            maybeInclude(true, 'foo', 'bar'),
            maybeInclude(false, 'a', 'b'),
            maybeInclude(true, ['c', 'd'])
        );
        expect(result).toMatchSnapshot();
    });
    it('can get module format', () => {
        function createDummyGenerator(useBrowserify, useJest, useWebpack) {
            const options = {
                useBrowserify,
                useJest,
                useWebpack
            };
            return {
                options,
                config: {get: () => false}
            };
        }
        const input = [
            /* useBrowserify, useJest, useWebpack */
            [false, false, false],
            [false, false, true],
            [false, true, false],
            [false, true, true],
            [true, true, true],
            [true, true, false],
            [true, false, true],
            [true, false, false]
        ];
        const results = input
            .map(values => createDummyGenerator(...values))
            .map(getModuleFormat);
        expect(results).toMatchSnapshot();
    });
    it('can get source directory', () => {
        function createDummyGenerator(isNative, src, sourceDirectory) {
            return {
                options: {src},
                use: {sourceDirectory},
                config: {get: () => isNative}
            };
        }
        const PATH_WITH_FORWARD_SLASH = 'foo/';
        const PATH_WITHOUT_FORWARD_SLASH = 'bar';
        const input = [
            /* isNative, options.src, use.sourceDirectory */
            [true, '', PATH_WITH_FORWARD_SLASH],
            [true, '', PATH_WITHOUT_FORWARD_SLASH],
            [true, 'src', PATH_WITH_FORWARD_SLASH],
            [true, 'src', PATH_WITHOUT_FORWARD_SLASH],
            [false, '', PATH_WITH_FORWARD_SLASH],
            [false, '', PATH_WITHOUT_FORWARD_SLASH],
            [false, 'src', PATH_WITH_FORWARD_SLASH],
            [false, 'src', PATH_WITHOUT_FORWARD_SLASH]
        ];
        const results = input
            .map(values => createDummyGenerator(...values))
            .map(getSourceDirectory);
        expect(results).toMatchSnapshot();
    });
    it('can get project variables (with --skip options)', () => {
        function createDummyGenerator(slim) {
            const projectName = 'my-project';
            return {
                options: {slim},
                use: {
                    projectName
                },
                config: {get: () => false}
            };
        }
        const input = [
            /*  slim */
            [false],
            [true],
            [false],
            [true]
        ];
        const results = input
            .map(values => createDummyGenerator(...values))
            .map(getProjectVariables);
        expect(results).toMatchSnapshot();
    });
    it('can resolve CSS preprocessor', () => {
        function createDummyGenerator(useLess, useSass) {
            return {
                config: {getAll: () => ({useLess, useSass})}
            };
        }
        const input = [
            /* useLess, useSass */
            [true, true],
            [true, false],
            [false, true],
            [false, false]
        ];
        const results = input
            .map(values => createDummyGenerator(...values))
            .map(resolveCssPreprocessor);
        expect(results).toMatchSnapshot();
    });
    it('can determine when to use Browserify', () => {
        expect(shouldUseBrowserify('webpack')).toBeFalsy();
        expect(shouldUseBrowserify('rjs')).toBeFalsy();
        expect(shouldUseBrowserify('browserify')).toBeTruthy();
        expect(shouldUseBrowserify('not a known bundler')).toBeTruthy(); // Browserify is default "non AMD" choice
    });
});
describe('JSON utilities', () => {
    let content;
    const testJSON = join(__dirname, 'test.json');
    beforeEach(() => {
        json.write(testJSON, {foo: 'bar'});
    });
    afterEach(() => {
        unlinkSync(testJSON);
    });
    it('can extend JSON files', () => {
        content = json.read(testJSON);
        expect(content).toMatchSnapshot();
        json.extend(testJSON, {bar: 'baz'});
        content = json.read(testJSON);
        expect(content).toMatchSnapshot();
    });
});

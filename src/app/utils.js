/* @flow */
import type {ProjectGenerator, WebappGenerator} from '../types';

const {findKey, merge, partialRight} = require('lodash');
const {readFileSync, writeFileSync}  = require('fs-extra');
const {project}                      = require('../app/prompts');
const banner                         = require('../app/banner');

const maybeInclude = partialRight(maybe, []);
const resolveModuleFormat = (bundler: string) => (bundler === 'rjs') ? 'amd' : 'commonjs';

module.exports = {
    copy,
    copyTpl,
    getModuleFormat,
    getProjectVariables,
    getSourceDirectory,
    maybe,
    maybeInclude,
    parseModuleData,
    resolveModuleFormat,
    resolveCssPreprocessor,
    shouldUseBrowserify,
    showBanner,
    json: {
        read:   readJSON,
        write:  writeJSON,
        extend: extendJSON
    },
    object: {
        clone:  cloneObject
    }
};

function copy(from: string, to: string, context: any) {
    const source = context.templatePath(from);
    const dest = context.destinationPath(to);
    context.fs.copy(source, dest);
}
function copyTpl(from: string, to: string, context: any) {
    const source = context.templatePath(from);
    const dest = context.destinationPath(to);
    context.fs.copyTpl(source, dest, context);
}
function getModuleFormat(generator: (ProjectGenerator | WebappGenerator)): string {
    const {config, options} = generator;
    const {useBrowserify, useJest, useWebpack} = options;
    const USE_BROWSERIFY = (useBrowserify === true) || !!config.get('useBrowserify');
    const USE_WEBPACK = (useWebpack === true) || !!config.get('useWebpack');
    return (useJest || USE_BROWSERIFY || USE_WEBPACK) ? 'commonjs' : 'amd';
}
function getProjectVariables(generator: ProjectGenerator) {
    const {options, use} = generator;
    const {projectName} = use;
    const {name} = options;
    const shouldUseNameOption = (typeof name === 'string') && (name !== project.defaults.projectName);
    return {
        projectName:     shouldUseNameOption ? name : projectName,
        isNative:        generator.config.get('isNative'),
        sourceDirectory: getSourceDirectory(generator)
    };
}
function getSourceDirectory(generator: ProjectGenerator): string {
    const {options, use} = generator;
    const isNative = generator.config.get('isNative');
    const sourceDirectory = (options.src !== '') ? options.src : use.sourceDirectory;
    return isNative ? 'renderer/' : (!/\/$/.test(sourceDirectory)) ? `${sourceDirectory}/` : sourceDirectory;
}
function maybe(condition: boolean, val: any, defaultValue: any = []) {
    return ((typeof condition === 'boolean') && condition) ? val : defaultValue;
}
function parseModuleData(str: string): any[] {
    const BUNDLER_LOOKUP = {
        browserify: /browserify/i,
        webpack: /webpack/i,
        rjs: /r[.]js/i
    };
    const data = str.split(' with ');
    return [data[0], findKey(BUNDLER_LOOKUP, re => re.test(data[1]))];
}
function resolveCssPreprocessor(generator: WebappGenerator) {
    const {config} = generator;
    const {useLess, useSass} = config.getAll();
    return useLess ? 'less' : (useSass ? 'sass' : 'none');
}
function shouldUseBrowserify(scriptBundler: WebappGenerator) {
    const moduleFormat = (scriptBundler !== 'rjs') ? 'commonjs' : 'amd';
    const useWebpack = (scriptBundler === 'webpack');
    const useAmd = (moduleFormat === 'amd');
    return !(useAmd || useWebpack);
}
function showBanner(generator: ProjectGenerator) {
    const {config, log} = generator;
    const hideBanner = config.get('hideBanner');
    hideBanner || log(banner);
}
function readJSON(fileName: string) {
    return JSON.parse(readFileSync(fileName).toString());
}
function writeJSON(fileName: string, content: any) {
    const INDENT_SPACES = 4;
    writeFileSync(fileName, `${JSON.stringify(content, null, INDENT_SPACES)}\n`);
}
function extendJSON(fileName: string, obj: any) {
    writeJSON(fileName, merge(readJSON(fileName), obj));
}
function cloneObject(value: any) {
    return JSON.parse(JSON.stringify(value));
}

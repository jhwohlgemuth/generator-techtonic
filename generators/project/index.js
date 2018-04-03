

const { assign, partial } = require('lodash');

const { mkdirp, readFileSync, writeFileSync } = require('fs-extra');
const Generator = require('yeoman-generator');
const Gruntfile = require('gruntfile-editor');
const banner = require('../app/banner');
const footer = require('../app/doneMessage');
const { project } = require('../app/prompts');
const tasks = require('../app/gruntTaskConfigs');
const COMMAND_LINE_OPTIONS = require('./commandLineOptions');
const {
    copyTpl,
    maybeInclude: iff,
    json: { extend }
} = require('../app/utils');

const showBanner = generator => {
    const hideBanner = generator.config.get('hideBanner');
    hideBanner || generator.log(banner);
};
const getSourceDirectory = generator => {
    const { options, use } = generator;
    const isNative = generator.config.get('isNative');
    const sourceDirectory = options.src !== '' ? options.src : use.sourceDirectory;
    return isNative ? 'renderer/' : !/\/$/.test(sourceDirectory) ? `${sourceDirectory}/` : sourceDirectory;
};
const getProjectVariables = generator => {
    const { options, use } = generator;
    const { skipBenchmark, skipCoveralls, skipJsinspect, slim } = options;
    const { projectName } = use;
    return {
        projectName,
        isNative: generator.config.get('isNative'),
        sourceDirectory: getSourceDirectory(generator),
        useBenchmark: use.benchmark && !skipBenchmark && !slim,
        useCoveralls: use.coveralls && !skipCoveralls && !slim,
        useJsinspect: use.jsinspect && !skipJsinspect && !slim
    };
};
const getModuleFormat = generator => {
    const { config, options } = generator;
    const { useBrowserify, useJest, useWebpack } = options;
    const USE_BROWSERIFY = useBrowserify === true || !!config.get('useBrowserify');
    const USE_WEBPACK = useWebpack === true || !!config.get('useWebpack');
    return useJest || USE_BROWSERIFY || USE_WEBPACK ? 'commonjs' : 'amd';
};

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        const generator = this;
        const { config, user } = generator;
        Object.keys(COMMAND_LINE_OPTIONS).forEach(function (option) {
            generator.option(option, COMMAND_LINE_OPTIONS[option]);
        });
        config.set('userName', user.git.name() ? user.git.name() : 'A. Developer');
    }
    prompting() {
        showBanner(this);
        const generator = this;
        const { config, options } = generator;
        const { isWebapp, userName } = config.getAll();
        const { defaults, useJest, useWebpack } = options;
        const isUnAnswered = option => !!!options[option.name] || options[option.name] === COMMAND_LINE_OPTIONS[option.name].defaults;
        const USE_WEBPACK = useWebpack === true || !!config.get('useWebpack');
        const USE_JEST = useJest || USE_WEBPACK;
        const moduleFormat = getModuleFormat(generator);
        const useAmd = moduleFormat === 'amd';
        const settings = {
            moduleFormat,
            useAmd,
            userName,
            use: project.defaults,
            useJest: USE_JEST,
            useWebpack: USE_WEBPACK
        };
        config.set(settings);
        assign(generator, settings);
        if (defaults) {
            const done = this.async();
            const settings = getProjectVariables(generator);
            config.set(settings);
            assign(generator, settings);
            done();
        } else {
            const questions = project.getQuestions({ isWebapp }).filter(isUnAnswered);
            return generator.prompt(questions).then(answers => {
                generator.use = answers;
                const settings = getProjectVariables(generator);
                config.set(settings);
                return assign(generator, settings);
            });
        }
    }
    writing() {
        const generator = this;
        const {
            isWebapp,
            moduleFormat,
            useBenchmark,
            useCoveralls,
            useJest,
            useWebpack
        } = generator.config.getAll();
        assign(generator, { moduleFormat });
        mkdirp(generator.sourceDirectory);
        const defaultTemplateData = [['_README.md', 'README.md'], ['_LICENSE', 'LICENSE'], ['_package.json', 'package.json'], ['config/_gitignore', '.gitignore'], ['config/_default.json', 'config/default.json']];
        const webappTemplateData = [['_Gruntfile.js', 'Gruntfile.js'], ['config/_eslintrc_webapp.js', 'config/.eslintrc.js']];
        const mochaTemplateData = [['test/mocha.opts', 'test/mocha.opts'], [`test/mocha/specs/${isWebapp ? 'example' : 'simple'}.spec.js`, 'test/mocha/specs/example.spec.js']];
        const jestTemplateData = [['test/jest/example.test.js', 'test/example.test.js']];
        const webpackTemplateData = [['config/_webpack.config.js', 'config/webpack.config.js']];
        defaultTemplateData.concat(iff(isWebapp, webappTemplateData, [['config/_eslintrc.js', 'config/.eslintrc.js']]), iff(useCoveralls, [['_travis.yml', '.travis.yml']]), iff(useBenchmark, [['test/example.benchmark.js', 'test/benchmarks/example.benchmark.js']]), iff(useBenchmark && !isWebapp, [['_Gruntfile.js', 'Gruntfile.js']]), iff(useJest, jestTemplateData, mochaTemplateData), iff(useWebpack, webpackTemplateData)).forEach(data => copyTpl(data[0], data[1], generator));
        copyTpl('test/data/**/*.*', 'test/data', generator);
    }
    install() {
        const generator = this;
        const { config } = generator;
        const {
            isWebapp,
            useBenchmark,
            useCoveralls,
            useJest,
            useJsinspect,
            useWebpack
        } = config.getAll();
        const updatePackageJson = partial(extend, generator.destinationPath('package.json'));
        const isNotWindows = ['linux', 'freebsd'].includes(process.platform);
        const karmaDependencies = ['karma', 'karma-chrome-launcher', 'karma-coverage', 'karma-firefox-launcher', 'karma-mocha', 'karma-chai', 'karma-sinon', 'karma-spec-reporter'];
        const devDependencies = [].concat(iff(isNotWindows, 'stmux'), iff(isWebapp && useWebpack, 'grunt-webpack'), iff(useBenchmark, ['lodash', 'grunt', 'load-grunt-tasks', 'time-grunt', 'config', 'grunt-benchmark']), iff(useCoveralls, 'coveralls'), iff(useCoveralls && isWebapp, 'grunt-karma-coveralls'), iff(useJest, ['coveralls', 'watch', 'jest'], ['mocha', 'chai', 'sinon', 'nyc', ...karmaDependencies]), iff(useJsinspect, 'jsinspect'), iff(useJsinspect && isWebapp, ['jsinspect', 'grunt-jsinspect']), iff(useWebpack, ['webpack@3.11.0', 'webpack-dev-server', 'webpack-dashboard', 'babel-loader']));
        generator.npmInstall();
        generator.npmInstall(devDependencies, { saveDev: true });
        updatePackageJson(getJestConfig(generator));
        updatePackageJson(getScripts(generator));
        //
        // Configure workflow tasks
        //
        if (useBenchmark) {
            const placeholder = '/* -- load tasks placeholder -- */';
            const text = readFileSync(generator.destinationPath('Gruntfile.js')).toString().replace(placeholder, isWebapp ? placeholder : '');
            const gruntfile = new Gruntfile(text);
            gruntfile.insertConfig('benchmark', tasks.benchmark);
            writeFileSync(generator.destinationPath('Gruntfile.js'), gruntfile.toString());
        }
    }
    end() {
        const { config, log } = this;
        config.get('isComposed') || log(footer(this));
    }
};
function getJestConfig(generator) {
    const useJest = generator.config.get('useJest');
    return !useJest ? {} : {
        jest: {
            testMatch: ['**/test/**/*.js']
        }
    };
}
function getScripts(generator) {
    const {
        useBenchmark,
        useCoveralls,
        useJest,
        useWebpack
    } = generator.config.getAll();
    const scripts = { coverage: 'nyc report -r text' };
    useBenchmark && assign(scripts, {
        'test:perf': 'grunt benchmark'
    });
    useCoveralls && assign(scripts, {
        'test:travis': useJest ? 'npm run coverage && cat ./coverage/lcov.info | coveralls' : 'nyc report --reporter=text-lcov | coveralls'
    });
    useJest && assign(scripts, {
        test: 'jest .*.test.js',
        coverage: 'npm test -- --coverage',
        'test:watch': 'npm test -- --watch',
        'lint:tests': 'eslint -c ./config/.eslintrc.js ./test/*.js'
    });
    useWebpack && assign(scripts, {
        'build:watch': 'webpack-dashboard -- webpack-dev-server --config ./config/webpack.config.js'
    });
    /* istanbul ignore else */
    if (['linux', 'freebsd'].includes(process.platform)) {
        assign(scripts, {
            dev: 'stmux [ \"npm run test:watch\" .. \"npm run lint:watch\" ]'
        });
    }
    return { scripts };
}
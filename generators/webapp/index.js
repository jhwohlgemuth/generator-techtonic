

const { assign, flow, partial } = require('lodash');

const { mkdirp, readFileSync, writeFileSync } = require('fs-extra');
const Generator = require('yeoman-generator');
const Gruntfile = require('gruntfile-editor');
const { webapp } = require('../app/prompts');
const tasks = require('../app/gruntTaskConfigs');
const COMMAND_LINE_OPTIONS = require('./commandLineOptions');
const {
    copy,
    copyTpl,
    getModuleFormat,
    json: { extend },
    maybeInclude: iff,
    parseModuleData,
    resolveCssPreprocessor,
    resolveModuleFormat,
    shouldUseBrowserify
} = require('../app/utils');

const CSS_PREPROCESSOR_EXT_LOOKUP = {
    less: 'less',
    sass: 'scss',
    none: 'css'
};
const ports = {
    server: 1337,
    karma: 4669,
    livereload: 46692
};

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        const generator = this;
        Object.keys(COMMAND_LINE_OPTIONS).forEach(option => {
            generator.option(option, COMMAND_LINE_OPTIONS[option]);
        });
    }
    prompting() {
        const generator = this;
        const { config, options } = generator;
        const { useBrowserify, useJest, useRust, useWebpack } = options;

        const isUnAnswered = option => !!!options[option.name] || options[option.name] === COMMAND_LINE_OPTIONS[option.name].defaults;
        const isWebapp = true;
        if (options.defaults) {
            const done = this.async();
            generator.use = webapp.defaults;
            const moduleFormat = getModuleFormat(generator);
            const useAmd = moduleFormat === 'amd';
            const settings = {
                moduleFormat,
                ports,
                useAmd,
                useRust,
                useWebpack,
                useBrowserify: useBrowserify || !(useAmd || useWebpack), // Browserify is default
                useJest: useJest || useWebpack, // Jest is ONLY an option and does not need to be saved via config
                useLess: options.cssPreprocessor === 'less',
                useSass: options.cssPreprocessor === 'sass',
                useHandlebars: options.templateTechnology === 'handlebars'
            };
            config.set(settings);
            assign(generator, generator.use, settings);
            done();
        } else {
            const questions = webapp.getQuestions({ isWebapp }).filter(isUnAnswered);
            return generator.prompt(questions).then(answers => {
                const { cssPreprocessor, templateTechnology } = options;
                const USE_DEFAULT_CSS_PREPROCESSOR = cssPreprocessor === COMMAND_LINE_OPTIONS.cssPreprocessor.defaults;
                const USE_DEFAULT_TEMPLATE_RENDERER = templateTechnology === COMMAND_LINE_OPTIONS.templateTechnology.defaults;
                const CSS_PREPROCESSOR = USE_DEFAULT_CSS_PREPROCESSOR ? answers.cssPreprocessor.toLowerCase() : cssPreprocessor;
                const TEMPLATE_TECHNOLOGY = USE_DEFAULT_TEMPLATE_RENDERER ? answers.templateTechnology.toLowerCase() : templateTechnology;
                const SCRIPT_BUNDLER = parseModuleData(answers.moduleData)[1].toLowerCase();
                const USE_BROWSERIFY = SCRIPT_BUNDLER === 'browserify';
                const USE_WEBPACK = SCRIPT_BUNDLER === 'webpack' || useWebpack;
                const moduleFormat = resolveModuleFormat(SCRIPT_BUNDLER);
                const useAmd = moduleFormat === 'amd';
                const settings = {
                    moduleFormat,
                    ports,
                    use: answers,
                    useAmd,
                    useBrowserify: USE_BROWSERIFY || shouldUseBrowserify(SCRIPT_BUNDLER), // Browserify is default
                    useWebpack: USE_WEBPACK,
                    useJest: useJest || USE_WEBPACK, // Jest is ONLY an option and does not need to be saved via config
                    useLess: CSS_PREPROCESSOR === 'less',
                    useSass: CSS_PREPROCESSOR === 'sass',
                    useHandlebars: TEMPLATE_TECHNOLOGY === 'handlebars'
                };
                config.set(settings);
                return assign(generator, settings);
            });
        }
    }
    writing() {
        const generator = this;
        const { config, options, use, user } = generator;
        const { skipImagemin, slim } = options;
        const {
            isNative,
            projectName,
            sourceDirectory,
            useAmd,
            useHandlebars,
            useJest,
            useRust,
            useWebpack
        } = config.getAll();
        const userName = config.get('userName') || user.git.name();
        const useImagemin = use.imagemin && !skipImagemin && !slim;
        const appDirectory = `${sourceDirectory}app/`;
        const assetsDirectory = `${sourceDirectory}assets/`;
        const pluginDirectory = sourceDirectory;
        const type = resolveCssPreprocessor(this);
        const ext = CSS_PREPROCESSOR_EXT_LOOKUP[type];
        config.set({
            useImagemin,
            pluginDirectory
        });
        assign(generator, {
            sourceDirectory,
            isNative,
            projectName,
            useImagemin,
            userName
        });
        [// always included
        ['config/stylelint.config.js', 'config/stylelint.config.js'], ['tasks/webapp.js', 'tasks/webapp.js']].concat( // optional dependencies
        iff(useAmd, [['_config.js', `${appDirectory}config.js`]])).concat(iff(useAmd, [['test/config.js', 'test/config.js'], ['config/_karma.conf.amd.js', 'config/karma.conf.js']])).concat(iff(!(useAmd || useJest || useWebpack), [['config/_karma.conf.cjs.js', 'config/karma.conf.js']])).forEach(data => copyTpl(...data, generator));
        //
        // Write boilerplate files
        //
        [].concat(iff(useHandlebars, [['helpers/handlebars.helpers.js', 'helpers/handlebars.helpers.js']]), iff(useRust, [['helpers/importWasm.js', 'helpers/importWasm.js']]), [['helpers/jquery.extensions.js', 'helpers/jquery.extensions.js']], [['plugins/*.js', 'plugins']], [['shims/*.js', 'shims']], [['_index.html', 'index.html']], [['_app.js', 'app.js']], [['_main.js', 'main.js']], [['_router.js', 'router.js']], [['example.model.js', 'models/example.js']], [['example.view.js', 'views/example.js']], [['example.controller.js', 'controllers/example.js']]).map(data => [data[0], `${appDirectory}${data[1]}`]).forEach(data => copyTpl(...data, generator));
        //
        // Write assets files
        //
        ['fonts', 'images', 'templates', 'library', 'workers'].concat( // optional folders
        iff(useRust, 'rust')).forEach(path => mkdirp(`${assetsDirectory}${path}`));
        copy('library/*', `${assetsDirectory}library`, generator);
        copy('omaha.png', `${assetsDirectory}images/logo.png`, generator);
        [].concat(iff(useAmd, [['example.webworker.amd.js', 'workers/example.webworker.amd.js']], [['example.webworker.js', 'workers/example.webworker.js']]), iff(type === 'none', [[// No CSS pre-processor
        '_style.css', 'css/style.css']], [[// Main style sheet
        `_style.${ext}`, `${type}/style.${ext}`]]), iff(useRust, [['main.rs', 'rust/main.rs'], ['counter.rs', 'rust/counter.rs']]), [['example.template.hbs', 'templates/example.hbs']]).map(data => [data[0], `${assetsDirectory}${data[1]}`]).forEach(data => copyTpl(...data, generator));
    }
    install() {
        const generator = this;
        const { config } = generator;
        const {
            sourceDirectory,
            useAmd,
            useBrowserify,
            useHandlebars,
            useImagemin,
            useJest,
            useLess,
            useSass
        } = config.getAll();
        const type = resolveCssPreprocessor(generator);
        const ext = CSS_PREPROCESSOR_EXT_LOOKUP[type];
        const updatePackageJson = partial(extend, generator.destinationPath('package.json'));
        // $FlowFixMe
        const configurePackageJson = flow(getPackageJsonAttributes, updatePackageJson).bind(generator);
        const placeholder = '/* -- load tasks placeholder -- */';
        const loadTasks = 'grunt.loadTasks(config.folders.tasks);';
        const dependencies = [// always included
        'backbone', 'backbone.marionette', 'backbone.radio', 'jquery', 'lodash', 'morphdom', 'redux'].concat( // conditional dependencies
        iff(useHandlebars, 'handlebars'), iff(useAmd, 'requirejs'));
        const htmlDevDependencies = ['grunt-contrib-htmlmin'];
        const cssDevDependencies = ['grunt-postcss', 'autoprefixer', 'stylelint', 'stylelint-config-recommended', 'cssnano', 'normalize.css', 'postcss-reporter', 'postcss-safe-parser', 'mdcss', 'mdcss-theme-github'].concat(iff(type === 'none', ['postcss-import', 'postcss-cssnext']));
        const requirejsDevDependencies = ['grunt-contrib-requirejs', 'karma-requirejs'];
        const browserifyDependencies = ['browserify', 'browserify-shim', 'aliasify', 'babelify', 'deamdify', 'grunt-browserify'].concat(iff(useBrowserify && !useJest, ['karma-browserify', 'browserify-istanbul']));
        const gruntDependencies = ['grunt', 'grunt-browser-sync', 'grunt-cli', 'grunt-contrib-clean', 'grunt-contrib-copy', 'grunt-contrib-uglify', 'grunt-contrib-watch', 'grunt-jsdoc', 'grunt-parallel', 'grunt-replace', 'load-grunt-tasks', 'time-grunt'].concat(iff(!useJest, 'grunt-karma'));
        const workflowDependencies = ['babel-cli', 'babel-preset-env', 'config', 'eslint-plugin-backbone', 'fs-promise', 'globby', 'json-server', 'opn-cli'].concat( // conditional dependencies
        iff(!useBrowserify, 'babel-preset-minify@0.3.0'), iff(!useJest, requirejsDevDependencies), ...gruntDependencies, ...htmlDevDependencies, ...cssDevDependencies);
        const devDependencies = workflowDependencies.concat(iff(useBrowserify, browserifyDependencies), iff(useImagemin, 'grunt-contrib-imagemin'), iff(useLess, 'grunt-contrib-less'), iff(useSass, 'grunt-contrib-sass'), iff(useHandlebars, 'grunt-contrib-handlebars', 'grunt-contrib-jst'));
        generator.npmInstall(dependencies, { save: true });
        generator.npmInstall(devDependencies, { saveDev: true });
        //
        // Configure default.json
        //
        if (type !== 'none') {
            extend(generator.destinationPath('config/default.json'), {
                grunt: {
                    files: {
                        styles: `${type}/**/*.${ext}`
                    }
                }
            });
        }
        extend(generator.destinationPath('config/default.json'), {
            grunt: {
                ports,
                folders: {
                    app: `${sourceDirectory}app`,
                    assets: `${sourceDirectory}assets`
                }
            }
        });
        config.get('isNative') && extend(generator.destinationPath('config/default.json'), {
            grunt: {
                folders: {
                    dist: `${sourceDirectory}dist`
                }
            }
        });
        //
        // Configure package.json
        //
        configurePackageJson();
        if (useBrowserify) {
            updatePackageJson({
                browser: {
                    underscore: './node_modules/lodash/lodash.min.js',
                    lodash: './node_modules/lodash/lodash.min.js'
                },
                browserify: {
                    transform: ['deamdify', 'browserify-shim', 'aliasify', 'babelify']
                },
                'browserify-shim': {
                    underscore: '_'
                },
                aliasify: {
                    aliases: {
                        app: `./${sourceDirectory}app/app`,
                        router: `./${sourceDirectory}app/router`,
                        templates: `./${sourceDirectory}app/templates`
                    },
                    replacements: {
                        'models/(\\w+)': `./${sourceDirectory}app/models/$1`,
                        'views/(\\w+)': `./${sourceDirectory}app/views/$1`,
                        'controllers/(\\w+)': `./${sourceDirectory}app/controllers/$1`,
                        'plugins/(\\w+)': `./${sourceDirectory}app/plugins/$1`,
                        'shims/(\\w+)': `./${sourceDirectory}app/shims/$1`
                    }
                }
            });
        }
        //
        // Configure workflow tasks
        //
        const text = readFileSync(generator.destinationPath('Gruntfile.js')).toString().replace(placeholder, loadTasks);
        const gruntfile = new Gruntfile(text);
        //
        // Get grunt tasks based on user input
        //
        getTasks(generator).sort().forEach(name => gruntfile.insertConfig(name, tasks[name]));
        //
        // Register custom grunt tasks
        //
        gruntfile.insertConfig('postcss', tasks.postcss(sourceDirectory, type === 'none'));
        gruntfile.registerTask('default', ['serve']);
        //
        // Write to file and display footer
        //
        writeFileSync(generator.destinationPath('Gruntfile.js'), gruntfile.toString());
    }
};
function getPackageJsonAttributes() {
    const generator = this;
    const {
        isNative,
        sourceDirectory,
        useBrowserify
        // $FlowFixMe
    } = generator.config.getAll();
    const main = isNative ? './index.js' : `${sourceDirectory}app/main.js`;
    // $FlowFixMe
    const scripts = getScripts(generator);
    const babel = {
        plugins: [],
        presets: [['env', { modules: false }]].concat(iff(!useBrowserify, 'minify'))
    };
    const stylelint = { extends: './config/stylelint.config.js' };
    return { main, scripts, babel, stylelint };
}
function getScripts(generator) {
    const {
        isNative,
        sourceDirectory,
        useAmd,
        useJest,
        useRust
    } = generator.config.getAll();
    const scripts = {
        lint: `eslint -c ./config/.eslintrc.js --ignore-path ./config/.eslintignore ${sourceDirectory}app/**/*.js --fix`,
        'lint:watch': `watch "npm run lint" ${sourceDirectory}app`,
        'pretest': 'npm run lint',
        test: 'grunt test',
        'test:watch': 'grunt karma:covering',
        docs: 'grunt reports',
        postdocs: 'npm run open:docs',
        styleguide: 'grunt reports',
        poststyleguide: 'npm run open:styleguide',
        'open:coverage': 'opn ./reports/coverage/report-html/index.html',
        'open:docs': 'opn ./reports/docs/index.html',
        'open:styleguide': 'opn ./styleguide/index.html'
    };
    if (isNative) {
        assign(scripts, {
            start: 'grunt compile && electron index',
            build: 'echo under construction',
            'build:webapp': 'grunt build'
        });
    } else {
        assign(scripts, {
            start: 'grunt serve',
            build: 'grunt build',
            'build:css': 'grunt process-styles',
            'build:css:watch': 'grunt process-styles watch:style',
            predemo: 'npm run build',
            demo: 'grunt browserSync:demo',
            predeploy: 'npm run build'
        });
    }
    if (useAmd) {
        // CAUTION: This is a static reference to dist/client directory
        const dist = './dist/client/';
        const temp = `${dist}temp.js`;
        assign(scripts, {
            postbuild: `babel ${temp} -o ${dist}config.js && rm ${temp}`
        });
    }
    useJest && assign(scripts, {
        pretest: 'npm run lint',
        test: 'jest .*.test.js --coverage',
        'test:watch': 'npm test -- --watch'
    });
    useRust && assign(scripts, {
        'build:wasm': `rustc +nightly --target wasm32-unknown-unknown -O --crate-type=cdylib ${sourceDirectory}assets/rust/main.rs -o ${sourceDirectory}assets/rust/main.wasm`, // eslint-disable-line max-len
        'postbuild:wasm': `wasm-gc ${sourceDirectory}assets/rust/main.wasm ${sourceDirectory}assets/rust/main.min.wasm`
    });
    return scripts;
}
function getTasks(generator) {
    const { config } = generator;
    const {
        useBrowserify,
        useHandlebars,
        useImagemin,
        useLess,
        useSass,
        useWebpack
    } = config.getAll();
    return [// Tasks enabled by default
    'browserSync', 'clean', 'copy', 'htmlmin', 'jsdoc', 'karma', 'replace', 'requirejs', 'watch'].concat( // Webapp tasks enabled by user
    iff(useBrowserify, 'browserify'), iff(useHandlebars, 'handlebars', 'jst'), iff(useImagemin, ['imagemin', 'copy']), iff(useLess, 'less'), iff(useSass, 'sass'), iff(useWebpack, 'webpack'), iff(useWebpack || useBrowserify, 'uglify'));
}
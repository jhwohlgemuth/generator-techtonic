'use strict';

var fs        = require('fs');
var mkdirp    = require('mkdirp');
var yeoman    = require('yeoman-generator');
var Gruntfile = require('gruntfile-editor');
var utils     = require('../app/utils');
var banner    = require('../app/banner');
var prompt    = require('../app/prompts').webapp;
var tasks     = require('../app/gruntTaskConfigs');
var footer    = require('./doneMessage');

var commandLineOptions = {
    defaults: {
        type: 'Boolean',
        desc: 'Scaffold app with no user input using default settings',
        defaults: false
    },
    scriptBundler: {
        type: 'String',
        desc: 'Choose script bundler',
        defaults: ''
    },
    cssPreprocessor: {
        type: 'String',
        desc: 'Choose CSS pre-processor',
        defaults: 'less'
    },
    templateTechnology: {
        desc: 'Choose technology to use when pre-compiling templates',
        defaults: 'handlebars'
    },
    skipImagemin: {
        type: 'Boolean',
        desc: 'DO NOT add image minification to project deploy pipeline',
        defaults: false
    },
    skipAria: {
        type: 'Boolean',
        desc: 'DO NOT add ARIA auditing tasks and dependencies to project',
        defaults: false
    }
};

module.exports = yeoman.generators.Base.extend({
    constructor: function() {
        var generator = this;
        yeoman.generators.Base.apply(generator, arguments);
        Object.keys(commandLineOptions).forEach(function(option) {
            generator.option(option, commandLineOptions[option]);
        });
    },
    prompting: function() {
        var done = this.async();
        var generator = this;
        !generator.config.get('hideBanner') && generator.log(banner);
        if (generator.options.defaults) {
            generator.use = prompt.defaults;
            Object.keys(prompt.defaults).forEach(function(option) {
                generator[option] = prompt.defaults[option];
            });
            var bundler = generator.options.scriptBundler;
            var preprocessor = generator.options.cssPreprocessor;
            var templateTechnology = generator.options.templateTechnology;
            var options = {
                useBrowserify: (bundler === 'browserify') || prompt.defaults.useBrowserify,
                useLess:       (preprocessor === 'less'),
                useSass:       (preprocessor === 'sass'),
                useHandlebars: (templateTechnology === 'handlebars')
            };
            Object.keys(options).forEach(function(option) {
                generator[option] = options[option];
            });
            done();
        } else {
            function isUnAnswered(option) {
                return !!!generator.options[option.name] || (generator.options[option.name] === commandLineOptions[option.name].defaults);
            }
            generator.prompt(prompt.questions.filter(isUnAnswered), function (props) {
                generator.use = props;
                var bundler = (generator.options.scriptBundler || generator.use.scriptBundler).toLowerCase();
                var preprocessor;
                if (generator.options.cssPreprocessor === commandLineOptions.cssPreprocessor.defaults) {
                    preprocessor = generator.use.cssPreprocessor.toLowerCase();
                } else {
                    preprocessor = generator.options.cssPreprocessor;
                }
                var templateTechnology;
                if (generator.options.templateTechnology === commandLineOptions.templateTechnology.defaults) {
                    templateTechnology = generator.use.templateTechnology.toLowerCase();
                } else {
                    templateTechnology = generator.options.templateTechnology;
                }
                var options = {
                    useBrowserify: (bundler === 'browserify'),
                    useLess:       (preprocessor === 'less'),
                    useSass:       (preprocessor === 'sass'),
                    useHandlebars: (templateTechnology === 'handlebars')
                };
                Object.keys(options).forEach(function(option) {
                    generator[option] = options[option];
                });
                generator.appDir = (!/\/$/.test(props.appDir)) ? props.appDir + '/' : props.appDir;
                done();
            }.bind(generator));
        }
    },
    writing: {
        configFiles: function() {
            var generator = this;
            generator.projectName = generator.config.get('projectName');
            generator.userName = generator.config.get('userName') || generator.user.git.name();
            generator.useAria = generator.use.aria && !generator.options.skipAria;
            generator.useImagemin = generator.use.imagemin && !generator.options.skipImagemin;
            generator.template('_README.md', 'README.md');
            generator.template('config/_csslintrc', 'config/.csslintrc');
            generator.template('tasks/webapp.js', 'tasks/webapp.js');
            generator.template('_config.js', generator.appDir + 'app/config.js');
        },
        appFiles: function() {
            if (this.useHandlebars) {
                this.fs.copy(
                    this.templatePath('helpers/handlebars.helpers.js'),
                    this.destinationPath(this.appDir + 'app/helpers/handlebars.helpers.js')
                );
            }
            this.fs.copy(
                this.templatePath('helpers/jquery.extensions.js'),
                this.destinationPath(this.appDir + 'app/helpers/jquery.extensions.js')
            );
            this.fs.copy(
                this.templatePath('helpers/underscore.mixins.js'),
                this.destinationPath(this.appDir + 'app/helpers/underscore.mixins.js')
            );
            this.fs.copy(
                this.templatePath('plugins/*.js'),
                this.destinationPath(this.appDir + 'app/plugins')
            );
            this.fs.copy(
                this.templatePath('shims/*.js'),
                this.destinationPath(this.appDir + 'app/shims')
            );
        },
        assets: function() {
            if (this.useLess) {
                mkdirp(this.appDir + 'assets/less');
            }
            if (this.useSass) {
                mkdirp(this.appDir + 'assets/sass');
            }
            mkdirp(this.appDir + 'assets/fonts');
            mkdirp(this.appDir + 'assets/images');
            mkdirp(this.appDir + 'assets/templates');
            mkdirp(this.appDir + 'assets/library');
            this.fs.copy(
                this.templatePath('library/require.min.js'),
                this.destinationPath(this.appDir + 'assets/library/require.min.js')
            );
            this.fs.copy(
                this.templatePath('techtonic.png'),
                this.destinationPath(this.appDir + 'assets/images/logo.png')
            );
        },
        boilerplate: function() {
            this.template('_index.html', this.appDir + 'app/index.html');
            this.template('_app.js', this.appDir + 'app/app.js');
            this.template('_main.js', this.appDir + 'app/main.js');
            this.template('_router.js', this.appDir + 'app/router.js');
            this.template('example.model.js', this.appDir + 'app/models/example.js');
            this.template('example.view.js', this.appDir + 'app/views/example.js');
            this.template('example.controller.js', this.appDir + 'app/controllers/example.js');
            this.template('example.webworker.js', this.appDir + 'app/controllers/example.webworker.js');
            this.template('example.template.hbs', this.appDir + 'assets/templates/example.hbs');
            if (this.useLess) {
                this.template('_reset.css', this.appDir + 'assets/less/reset.less');
                this.template('_style.less', this.appDir + 'assets/less/style.less');
            }
            else if (this.useSass) {
                this.template('_reset.css', this.appDir + 'assets/sass/reset.scss');
                this.template('_style.scss', this.appDir + 'assets/sass/style.scss');
            } else{
                this.template('_style.css', this.appDir + 'assets/css/style.css');
            }
        }
    },
    install: function() {
        var generator = this;
        var dependencies = [
            'requirejs',
            'jquery',
            'underscore',
            'backbone',
            'backbone.marionette',
            'backbone.radio'
        ];
        var htmlDevDependencies = [
            'grunt-contrib-htmlmin',
            'grunt-htmlhint-plus'
        ];
        var cssDevDependencies = [
            'grunt-contrib-csslint',
            'grunt-postcss',
            'autoprefixer',
            'cssnano',
            'postcss-safe-parser',
            'mdcss',
            'mdcss-theme-github'
        ];
        var requirejsDevDependencies = [
            'grunt-contrib-requirejs',
            'karma-requirejs'
        ];
        var devDependencies = [].concat(
            htmlDevDependencies,
            cssDevDependencies,
            requirejsDevDependencies,
            generator.useBrowserify ? ['browserify', 'browserify-shim', 'aliasify', 'deamdify', 'grunt-browserify', 'grunt-replace'] : [],
            generator.useAria ? ['grunt-a11y', 'grunt-accessibility'] : [],
            generator.useImagemin ? ['grunt-contrib-imagemin'] :[],
            generator.useLess ? ['grunt-contrib-less'] : [],
            generator.useSass ? ['grunt-contrib-sass'] : [],
            generator.useHandlebars ? ['grunt-contrib-handlebars'] : ['grunt-contrib-jst']
        );
        generator.useHandlebars && dependencies.push('handlebars');

        generator.npmInstall(dependencies, {save: true});
        generator.npmInstall(devDependencies, {saveDev: true});
    },
    end: function() {
        var generator = this;
        var appDir = (generator.appDir !== './') ? generator.appDir : '';
        var gruntfile = new Gruntfile(fs.readFileSync(generator.destinationPath('Gruntfile.js')).toString());
        if (generator.useAria) {
            gruntfile.insertConfig('a11y', tasks.a11y);
            gruntfile.insertConfig('accessibility', tasks.accessibility);
            gruntfile.registerTask('aria-audit', ['accessibility', 'a11y']);
        }
        if (generator.useBrowserify) {
            gruntfile.insertConfig('browserify', tasks.browserify);
            gruntfile.insertConfig('replace', tasks.replace);
            gruntfile.insertConfig('uglify', tasks.uglify);
            utils.json.extend(generator.destinationPath('package.json'), {
                browser: {
                    underscore: './node_modules/underscore/underscore-min.js'
                },
                browserify: {
                    transform: ['deamdify', 'browserify-shim', 'aliasify']
                },
                'browserify-shim': {
                    underscore: '_'
                },
                aliasify: {
                    aliases: {
                        app:       './' + appDir + 'app/app',
                        router:    './' + appDir + 'app/router',
                        templates: './' + appDir + 'app/templates'
                    },
                    replacements: {
                        'models/(\\w+)':      './' + appDir + 'app/models/$1',
                        'views/(\\w+)':       './' + appDir + 'app/views/$1',
                        'controllers/(\\w+)': './' + appDir + 'app/controllers/$1',
                        'plugins/(\\w+)':     './' + appDir + 'app/plugins/$1'
                    }
                }
            });
        }
        if (generator.useHandlebars) {
            gruntfile.insertConfig('handlebars', tasks.handlebars);
        } else {
            gruntfile.insertConfig('jst', tasks.jst);
        }
        if (generator.useImagemin) {
            gruntfile.insertConfig('imagemin', tasks.imagemin);
            gruntfile.insertConfig('copy', tasks.copy);
        }
        if (generator.useLess) {
            gruntfile.insertConfig('less', tasks.less);
            utils.json.extend(generator.destinationPath('config/default.json'), {
                grunt: {
                    files: {
                        styles: "less/**/*.less"
                    }
                }
            });
        }
        if (generator.useSass) {
            gruntfile.insertConfig('sass', tasks.sass);
            utils.json.extend(generator.destinationPath('config/default.json'), {
                grunt: {
                    files: {
                        styles: "sass/**/*.scss"
                    }
                }
            });
        }
        gruntfile.insertConfig('htmlhintplus', tasks.htmlhintplus);
        gruntfile.insertConfig('htmlmin', tasks.htmlmin);
        gruntfile.insertConfig('postcss', tasks.postcss(appDir));
        fs.writeFileSync(generator.destinationPath('Gruntfile.js'), gruntfile.toString());
        generator.log(footer(generator));
    }
});

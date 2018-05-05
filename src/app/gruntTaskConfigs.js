
module.exports = {
    /**
     * Use Browserify to bundle scripts
     * @see {@link https://github.com/jmreidy/grunt-browserify}
    **/
    browserify: `{
        bundle: {
            files: {
                '<%= folders.dist %>/<%= folders.client %>/bundle.min.js': [
                    '<%= folders.app %>/main.js'
                ]
            }
        }
    }`,
    /**
     * Live-reload enabled sychronized server for development, tests, and demos
     * @see {@link https://www.browsersync.io/docs/grunt}
    **/
    browserSync: `{
        amd: {
            bsFiles: {
                src: [
                    '<%= folders.app %>/<%= files.index %>',
                    '<%= folders.app %>/style.css',
                    '<%= folders.app %>/templates.js'
                ]
            },
            options: {
                port: '<%= ports.server %>',
                watchTask: true,
                reloadDelay: 500,
                server: {
                    baseDir: ['<%= folders.app %>'],
                    routes: {
                        '/node_modules': './node_modules',
                        '/assets': '<%= folders.assets %>',
                    },
                    index: '<%= files.index %>'
                }
            }
        },
        cjs: {
            bsFiles: {
                src: [
                    '<%= folders.dist %>/<%= folders.client %>/bundle.min.js'
                ]
            },
            options: {
                port: '<%= ports.server %>',
                watchTask: true,
                reloadDelay: 500,
                server: ['<%= folders.dist %>', '<%= folders.dist %>/<%= folders.client %>']
            }
        },
        demo: {
            options: {
                port: '<%= ports.server %>',
                server: ['<%= folders.dist %>', '<%= folders.dist %>/<%= folders.client %>']
            }
        }
    }`,
    /**
     * Clear files and folders
     * @see {@link https://github.com/gruntjs/grunt-contrib-clean}
    **/
    clean: `{
        options: {
            force: true
        },
        docs:       ['<%= folders.reports %>/<%= folders.docs %>/*', './styleguide'],
        coverage:   ['<%= folders.reports %>/<%= folders.coverage %>/'],
        compile:    ['<%= folders.app %>/templates.js', '<%= folders.app %>/style.css', '<%= folders.app %>/style.css.map'],
        build:      ['<%= folders.dist %>/<%= folders.client %>', '<%= folders.dist %>/<%= deployed.assets %>']
    }`,
    /**
     * Copy files and folders (used here to copy font files to deployment directory)
     * @see {@link https://github.com/gruntjs/grunt-contrib-copy}
     * WITH IMAGEMIN
    **/
    copy: `{
        fonts: {
            files: [{
                expand: true,
                cwd: '<%= folders.assets %>/fonts',
                src: ['<%= files.fonts %>'],
                dest: '<%= folders.dist %>/<%= deployed.assets %>/fonts',
                filter: 'isFile'
            }]
        },
        library: {
            files: [{
                expand: true,
                flatten: true,
                src: [
                    '<%= folders.assets %>/library/*.js',
                    '!<%= folders.assets %>/library/almond.min.js',
                    '!<%= folders.assets %>/library/require.min.js'
                ],
                dest: '<%= folders.dist %>/<%= deployed.assets %>/library',
                filter: 'isFile'
            }]
        },
        images: {
            files: [{
                expand: true,
                cwd: '<%= folders.assets %>/images',
                src: ['<%= files.images %>'],
                dest: '<%= folders.dist %>/<%= deployed.assets %>/images',
                filter: 'isFile'
            }]
        },
        workers: {
            files: [{
                expand: true,
                cwd: '<%= folders.assets %>/workers',
                src: ['<%= files.scripts %>'],
                dest: '<%= folders.dist %>/<%= deployed.assets %>/workers',
                filter: 'isFile'
            }]
        },
        wasm: {
            files: [{
                expand: true,
                cwd: '<%= folders.assets %>/rust',
                src: ['**/*.wasm'],
                dest: '<%= folders.dist %>/<%= deployed.assets %>/rust',
                filter: 'isFile'
            }]
        }
    }`,
    /**
     * Validate files with ESLint
     * @see {@link https://www.npmjs.com/package/grunt-eslint}
    **/
    eslint: `{
        options: {
            configFile: '<%= files.config.eslint %>'
        },
        ing: {
            options: {
                fix: true
            },
            src: ['<%= folders.app %>/<%= files.scripts %>', '!<%= folders.app %>/templates.js']
        },
        src: {
            options: {
                fix: true
            },
            src: ['<%= folders.app %>/<%= files.scripts %>', '!<%= folders.app %>/templates.js']
        },
        tests: {
            options: {
                fix: true
            },
            src: ['<%= folders.test %>/<%= folders.specs %>/<%= files.scripts %>']
        }
    }`,
    /**
     * Start an Express.js web server
     * @see {@link https://github.com/blai/grunt-express}
    **/
    express: `{
        main: {
            options: {
                bases: [__dirname],
                port: '<%= ports.server %>',
                hostname: '0.0.0.0',
                livereload: '<%= ports.livereload %>'
            }
        },
        demo: {
            options: {
                bases: [__dirname],
                port: '<%= ports.server %>',
                hostname: '0.0.0.0',
                serverreload: true
            }
        }
    }`,
    /**
     * Pre-compile Handlebars templates
     * @see {@link https://github.com/gruntjs/grunt-contrib-handlebars}
    **/
    handlebars: `{
        main: {
            options: {
                amd: true,
                //Use processName to name the template keys within the compiled templates.js file
                //'assets/templates/example.hbs' --> 'example'
                processName: function(filePath) {
                    return filePath
                        .replace(config.folders.assets, '')
                        .replace(/[/]templates[/]/, '')
                        .replace(/[.]hbs/, '');
                }
            },
            files: {
                '<%= folders.app %>/templates.js': ['<%= folders.assets %>/<%= files.templates %>']
            }
        }
    }`,
    /**
     * Lint HTML files
     * @see {@link https://github.com/yaniswang/HTMLHint}
    **/
    htmlhintplus: `{
        app: {
            src: [
              '<%= folders.assets %>/<%= files.templates %>',
              '<%= folders.app %>/<%= files.index %>'
            ]
        }
    }`,
    /**
     * Minimize index.html for deployment
     * @see {@link https://github.com/gruntjs/grunt-contrib-htmlmin}
    **/
    htmlmin: `{
        options: {
            removeComments: true,
            collapseWhitespace: true
        },
        build: {
            files: [
                {
                    src:  '<%= folders.app %>/<%= files.index %>',
                    dest: '<%= folders.dist %>/<%= folders.client %>/<%= files.index %>'
                }
            ]
        }
    }`,
    /**
     * Optimize image assets for deployment using imagemin
     * @see {@link https://github.com/gruntjs/grunt-contrib-imagemin}
    **/
    imagemin: `{
        build: {
            files: [{
                expand: true,
                flatten: false,
                cwd: './',
                src: ['<%= folders.assets %>/images/<%= files.images %>'],
                dest: '<%= folders.dist %>'
            }]
        }
    }`,
    /**
     * Generate documentation from JS comments using JSDoc3
     * @see {@link https://github.com/krampstudio/grunt-jsdoc}
    **/
    jsdoc: `{
        app: {
            src: ['<%= folders.app %>/<%= files.scripts %>', '!<%= folders.app %>/templates.js'],
            dest: '<%= folders.reports %>/<%= folders.docs %>',
            options: {
                readme: 'README.md'
            }
        }
    }`,
    /**
     * Lint project JSON files
     * @see {@link https://github.com/brandonramirez/grunt-jsonlint}
    **/
    jsonlint: `{
        project: {src: ['./*.json']}
    }`,
    /**
     * Pre-compile templates
     * @see {@link https://github.com/gruntjs/grunt-contrib-jst}
    **/
    jst: `{
        main: {
            options: {
                amd: true,
                //Use processName to name the template keys within the compiled templates.js file
                //'assets/templates/example.hbs' --> 'example'
                processName: function(filePath) {
                    return filePath
                        .replace(config.folders.assets, '')
                        .replace(/[/]templates[/]/, '')
                        .replace(/[.]hbs/, '');
                },
                templateSettings: {
                    variable: 'data',
                    interpolate : /\{\{(.+?)\}\}/g
                }
            },
            files: {
                '<%= folders.app %>/templates.js': ['<%= folders.assets %>/<%= files.templates %>']
            }
        }
    }`,
    /**
     * Run tests and generate code coverage with the Karma test runner
     * @see {@link https://github.com/karma-runner/grunt-karma}
    **/
    karma: `{
        options: {
            configFile: '<%= files.config.karma %>',
            port: '<%= ports.karma %>'
        },
        watch: {
            background: true,
            singleRun: false,
            coverageReporter: {
                dir: '<%= folders.reports %>/<%= folders.coverage %>/',
                includeAllSources: true
            }
        },
        coverage: {
            autoWatch: false,
            browsers: ['ChromeHeadless'],
            reporters: ['spec', 'coverage']
        },
        covering: {
            autoWatch: true,
            singleRun: false,
            browsers: ['Firefox'],
            reporters: ['progress', 'coverage']
        }
    }`,
    /**
     * Transpile LESS to CSS (with autoprefixed and minimized output)
     * @see {@link https://github.com/gruntjs/grunt-contrib-less}
    **/
    less: `{
        main: {
            options: {
                sourceMap: true,
                sourceMapFileInline: true,
                paths: ['<%= folders.assets %>/<%= files.styles %>']
            },
            files: {
                '<%= folders.app %>/style.css': '<%= folders.assets %>/less/style.less'
            }
        }
    }`,
    /**
     * Open files in browsers for review
     * @see {@link https://github.com/jsoverson/grunt-open}
    **/
    open: `{
        browser: {
            path: 'http://localhost:<%= ports.server %>/<%= folders.app %>'
        },
        demo: {
            path: 'http://localhost:<%= ports.server %>/<%= folders.dist %>/<%= folders.client %>'
        },
        coverage: {
            path: __dirname + '/<%= folders.reports %>/<%= folders.coverage %>/report-html/index.html'
        },
        plato: {
            path: __dirname + '/<%= folders.reports %>/plato/index.html'
        },
        docs: {
            path: __dirname + '/<%= folders.reports %>/<%= folders.docs %>/index.html'
        },
        styleguide: {
            path: __dirname + '/styleguide/index.html'
        }
    }`,
    /**
     * Generate persistent static analysis reports with plato
     * @see {@link https://github.com/jsoverson/grunt-plato}
    **/
    plato: `{
        app: {
            src: ['<%= folders.app %>/<%= files.scripts %>', '!<%= folders.app %>/templates.js'],
            dest: '<%= folders.reports %>/plato',
            options: {
                eslint: require(config.files.config.eslint)
            }
        }
    }`,
    /**
     * Apply several post-processors to your CSS using PostCSS
     * @see {@link https://github.com/nDmitry/grunt-postcss}
    **/
    postcss: (sourceDirectory, useCssnext) => `{
        options: {
            parser: require('postcss-safe-parser'),
            processors: [
                require('stylelint')(),
                ${useCssnext ? `require('postcss-import')(),
                require('postcss-cssnext')({
                    browsers: 'last 2 versions',
                    warnForDuplicates: false
                }),` : 'require(\'autoprefixer\')({browsers: \'last 2 versions\'}),'}
                require('cssnano')(),
                require('postcss-reporter')({clearReportedMessages: true})
            ]
        },
        dev: {
            options: {
                map: {
                    inline: false,
                    annotation: '<%= folders.app %>'
                }
            },
            src: ['<%= folders.app %>/*.css', '<%= folders.assets %>/css/style.css'],
            dest: '<%= folders.app %>/style.css'
        },
        prod: {
            src:  '<%= folders.app %>/*.css',
            dest: '<%= folders.dist %>/<%= folders.client %>/style.css'
        },
        styleguide: {
            options: {
                processors: [require('mdcss')({
                    examples: {
                        css: [
                            '../${sourceDirectory}app/style.css',
                            '../${sourceDirectory}assets/css/style.css'
                        ],
                    }
                })],
            },
            src:  ['<%= folders.app %>/*.css', '<%= folders.assets %>/css/*.css']
        }
    }`,
    /**
     * Use Applause to replace link to bundled scripts if using browserify
     * @see {@link https://github.com/outaTiME/grunt-replace}
    **/
    replace: `{
        'almond-shim': {
            options: {
                patterns: [{
                    match: /<script.*<\\/script>/g,
                    replacement: '<script src="config.js"></script>'
                }]
            },
            files: [{
                src:  '<%= folders.dist %>/<%= folders.client %>/<%= files.index %>',
                dest: '<%= folders.dist %>/<%= folders.client %>/<%= files.index %>'
            }]
        },
        'bundle-url': {
            options: {
                patterns: [{
                    match: /<script.*<\\/script>/g,
                    replacement: '<script src="bundle.min.js"></script>'
                }]
            },
            files: [{
                src:  '<%= folders.dist %>/<%= folders.client %>/<%= files.index %>',
                dest: '<%= folders.dist %>/<%= folders.client %>/<%= files.index %>'
            }]
        }
    }`,
    /**
     * Optimize JS code into single file using r.js
     * @see {@link https://github.com/gruntjs/grunt-contrib-requirejs}
     * @see (@link https://github.com/jrburke/r.js/blob/master/build/example.build.js}
    **/
    requirejs: `{
        bundle: {
            options: {
                out: '<%= folders.dist %>/<%= folders.client %>/temp.js',
                mainConfigFile: '<%= folders.app %>/<%= files.configScript %>',
                baseUrl: '<%= folders.app %>',
                include: [join(__dirname, '/<%= folders.assets %>/library/almond.min.js'), '<%= files.configScript %>'],
                preserveLicenseComments: false,
                findNestedDependencies: true,
                optimize: 'none'
            }
        }
    }`,
    /**
     * Transpile SCSS to CSS
     * @see {@link https://github.com/gruntjs/grunt-contrib-sass}
    **/
    sass: `{
        main: {
            options: {
                style: 'expanded',
                sourcemap: 'inline'
            },
            files: {
                '<%= folders.app %>/style.css': '<%= folders.assets %>/sass/style.scss'
            }
        }
    }`,
    /**
     * Minify JavaScript files with UglifyJS
     * @see {@link https://github.com/gruntjs/grunt-contrib-uglify}
    **/
    uglify: `{
        bundle: {
            options: {
                banner: '/* <%= package.name %> - v<%= package.version %> - 2017-11-22 */',
                mangle: true,
                comments: false,
                compress: {
                    drop_console: true// discard calls to console.* functions
                }
            },
            files: {
                '<%= folders.dist %>/<%= folders.client %>/bundle.min.js': [
                    '<%= folders.dist %>/<%= folders.client %>/bundle.min.js'
                ]
            }
        }
    }`,
    /**
     * Run predefined tasks whenever watched file patterns are added, changed or deleted
     * @see {@link https://github.com/gruntjs/grunt-contrib-watch}
    **/
    watch: `{
        style: {
            files: ['<%= folders.assets %>/<%= files.styles %>'],
            tasks: ['process-styles'],
            options: {spawn: false}
        },
        eslint: {
            files: '<%= folders.app %>/<%= files.scripts %>',
            tasks: ['eslint:ing'],
            options: {spawn: false}
        },
        lint: {
            files: [
                '<%= folders.app %>/style.css',
                '<%= folders.app %>/<%= files.scripts %>'
            ],
            tasks: ['lint'],
            options: {spawn: false}
        },
        browser: {
            files: [
                '<%= folders.app %>/<%= files.index %>',
                '<%= folders.assets %>/css/*.css',
                '<%= folders.app %>/style.css',
                '<%= folders.app %>/<%= files.scripts %>',
                '<%= folders.assets %>/<%= files.templates %>'
            ],
            tasks: ['compile'],
            options: {
                spawn: false
            }
        }
    }`,
    /**
     * Integrate webpack into grunt build process
     * @see {@link https://github.com/webpack-contrib/grunt-webpack}
    **/
    webpack: `{
        bundle: require('./config/webpack.config.js')
    }`
};

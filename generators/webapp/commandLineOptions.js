module.exports = {
    defaults: {
        type: Boolean,
        desc: 'Scaffold app with no user input using default settings',
        defaults: false
    },
    useBrowserify: {
        type: Boolean,
        desc: 'Use Browserify to bundle scripts',
        defaults: false
    },
    useJest: {
        type: Boolean,
        desc: 'Use Jest to run tests',
        defaults: false
    },
    useWebpack: {
        type: Boolean,
        desc: 'Use Webpack to bundle scripts',
        defaults: false
    },
    cssPreprocessor: {
        type: String,
        desc: 'Choose CSS pre-processor',
        defaults: 'less'
    },
    templateTechnology: {
        type: String,
        desc: 'Choose technology to use when pre-compiling templates',
        defaults: 'handlebars'
    },
    skipImagemin: {
        type: Boolean,
        desc: 'DO NOT add image minification to project deploy pipeline',
        defaults: false
    }
};
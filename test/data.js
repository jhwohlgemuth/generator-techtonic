//Config files that are ALWAYS created
var configFiles = [
    '.gitignore',
    'config/.csslintrc',
    'config/.eslintrc.js',
    'config/karma.conf.js',
    'config/default.json'
];
//Project files that are ALWAYS created
var projectFiles = [
    'package.json',
    'Gruntfile.js',
    'README.md',
    'LICENSE'
];
//Files that are ALWAYS created
var files = [
    //'tasks/main.js',
    //'tasks/build.js',
    //'tasks/test.js',
    'app/index.html',
    'app/app.js',
    'app/main.js',
    'app/config.js',
    'app/router.js',
    'assets/images/logo.png',
    'app/controllers/example.webworker.js'
];
//Dependencies that are CONDITIONALLY installed YES/NO
var dependencies = [
    // '"jsinspect": ',
    // 'grunt-jsinspect',
    // 'grunt-contrib-imagemin',
    // 'grunt-a11y',
    // 'grunt-accessibility',
    // 'grunt-benchmark'
];

var options = {
    projectFiles: projectFiles,
    configFiles:  configFiles,
    appFiles:     files,
    booleanDeps:  dependencies
};

module.exports = options;

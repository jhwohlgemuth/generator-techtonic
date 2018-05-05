module.exports = {
    defaults: {
        type: Boolean,
        desc: 'Scaffold app with no user input using default settings',
        defaults: false
    },
    src: {
        type: String,
        desc: 'Source directory for app and asset files (use with --defaults)',
        defaults: ''
    }
};
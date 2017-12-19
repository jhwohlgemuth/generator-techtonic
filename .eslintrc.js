// .eslintrc.js
// -> Curated selection of rules
// -> Maximum auto-fix capability
// -> Secure coding practices baked in
module.exports = {
    parser: 'babel-eslint',
    extends: 'omaha-prime-grade',
    env: {
        node: true,
        browser: true,
        es6: true,
        jest: true
    },
    rules: {
        'complexity': ['warn', 6],
        'max-nested-callbacks': ['warn', 4],
        'valid-jsdoc': 'off',
        'no-magic-numbers': ['warn', { 'ignore': [-1, 0, 1, 2, 3, 10, 100]}]
    }
};

const {extend, curry, head, pick, set, toLower} = require('lodash');
const {keys}                     = Object;
const chalk                      = require('chalk');
const {blue, red, yellow}        = chalk;
const {http, https, ws, graphql} = require('../server/ports');
const {lookup}                   = require('../server/data');

const projectQuestions = [
    {
        type: 'input',
        name: 'projectName',
        message: 'What do you want to name this project?',
        default: 'omaha-project'
    },
    {
        type: 'input',
        name: 'sourceDirectory',
        message: 'Where do you want to put the source code?',
        default: './'
    }
];
const webappQuestions = [
    {
        type: 'list',
        name: 'moduleData',
        message: 'Which module format & bundler?',
        choices: [
            `AMD with ${red('r.js')}`,
            `CommonJS with ${yellow('Browserify')}`,
            `CommonJS with ${blue('Webpack')}`
        ]
    },
    {
        type: 'list',
        name: 'cssPreprocessor',
        message: 'Which CSS pre-processor?',
        choices: ['less', 'Sass', 'none']
    },
    {
        type: 'list',
        name: 'templateTechnology',
        message: 'Which technology for templates?',
        choices: ['handlebars', 'lodash']
    },
    {
        type: 'confirm',
        name: 'aria',
        message: 'Enforce ARIA and Section 508 standards?',
        default: true
    },
    {
        type: 'confirm',
        name: 'imagemin',
        message: 'Use image compression for deployed application?',
        default: true
    }
];
const serverQuestions = [
    {
        type: 'input',
        name: 'httpPort',
        message: 'HTTP server port?',
        default: http
    },
    {
        type: 'input',
        name: 'httpsPort',
        message: 'HTTPS server port?',
        default: https
    },
    {
        type: 'input',
        name: 'websocketPort',
        message: 'WebSocket server port?',
        default: ws
    },
    {
        type: 'input',
        name: 'graphqlPort',
        message: 'GraphQL server port?',
        default: graphql
    },
    {
        type: 'confirm',
        name: 'enableGraphiql',
        message: 'Enable GraphiQL endpoint?',
        default: false
    },
    {
        type: 'confirm',
        name: 'markdownSupport',
        message: 'Add support for rendering Markdown files?',
        default: false
    },
    {
        type: 'checkbox',
        name: 'downloadData',
        message: 'Download data sets to explore:',
        default: [],
        choices: keys(lookup)
    }
];
const getPromptQuestions = curry(function(type, options) {
    const {isWebapp, isServer} = options;
    const questionLookup = {
        project: projectQuestions,
        webapp: webappQuestions,
        server: serverQuestions
    };
    return questionLookup[type].map(promptMessageFormat({type, isWebapp, isServer}));
});
const defaults = {
    project: projectQuestions
        .map(question => set({}, question.name, question.default))
        .reduce(extend),
    webapp: webappQuestions
        .map(question => pick(question, ['name', 'default', 'choices']))
        .map(item => set({}, item.name, Array.isArray(item.choices) ? head(item.choices.map(toLower)) : item.default))
        .reduce(extend)
};

function addLeadingZero(step) {return (step < 10) ? (`0${step}`) : step;}
function promptMessageFormat(options) {
    const {type, isWebapp, isServer} = options;
    let total = isServer ? serverQuestions.length : projectQuestions.length;
    total += isWebapp ? webappQuestions.length : 0;
    return function(question, index) {
        const step = index + 1 + ((type === 'webapp') ? projectQuestions.length : 0);
        question.message = chalk[step === total ? 'green' : 'gray'](`(${addLeadingZero(step)}/${total}) `) + question.message;
        return question;
    };
}

exports.project = {
    defaults: defaults.project,
    getQuestions: getPromptQuestions('project')
};
exports.webapp = {
    defaults: defaults.webapp,
    getQuestions: getPromptQuestions('webapp')
};
exports.server = {
    prompts: getPromptQuestions('server', {isServer: true})
};

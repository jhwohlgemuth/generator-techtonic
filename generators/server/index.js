'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.generators.Base.extend({
    prompting: function() {
        var done = this.async();
        var prompts = [
            {
                type: 'input',
                name: 'httpPort',
                message: 'HTTP server port?',
                default: '8111'
            },
            {
                type: 'input',
                name: 'httpsPort',
                message: 'HTTPS server port?',
                default: '8443'
            },
            {
                type: 'input',
                name: 'websocketPort',
                message: 'WebSocket server port?',
                default: '13337'
            }
        ];
        this.prompt(prompts, function (props) {
            this.props = props;
            this.serverDirectory = props.serverDirectory;
            this.httpPort        = props.httpPort;
            this.httpsPort       = props.httpsPort;
            this.websocketPort   = props.websocketPort;
            done();
        }.bind(this));
    },
    configuring: {
        projectfiles: function() {
            this.template('_package.json', 'package.json');
            this.template('_app.json', 'app.json');
            this.template('config/_default.js', 'config/default.js');
        }
    },
    writing: {
        serverFiles: function() {
            this.template('_index.js', 'index.js');
            this.template('_socket.js', 'web/socket.js'); //WebSocket server
            this.template('_server.js', 'web/server.js'); //HTTP server
            this.template('favicon.ico', 'favicon.ico');  //empty favicon
            this.fs.copy(
                this.templatePath('ssl/**/*.*'),
                this.destinationPath('web/ssl')
            );
        },
        boilerplate: function() {
            this.template('_index.html', 'web/client/index.html');
            this.template('example.md', 'web/markdown/example.md');
        }
    },
    install: function () {
        this.npmInstall();
    }
});
/* eslint strict: 0 */
/* eslint no-console: 0 */
/**
 * @file Logging module that leverages Backbone.Radio
 * @module plugins/logging
 * @example <caption>Extend application object</caption>
 * var logging = require('./plugins/radio.logging');
 * var app = new Marionette.Application();
 * module.exports = Object.assign(app, logging);
 * @example <caption>Use console message methods with custom stylized output</caption>
 * var app = require('app');
 * app.log('hello world');
 * app.info('hello world');
 * app.warn('hello world');
 * app.error('hello world');
 * @example <caption>Leverage Backbone.Radio to "tune" in and out on channels</caption>
 * var app = require('app');
 * setInterval(function() {
 *    app.radio.channel('test').trigger('log', 'message');
 * }, 1000);
 * app.radio.level('log');   //set logging level
 * app.radio.tuneIn('test'); //no need to create the channel first
 * // See some beautiful log messages in the console
 * app.radio.tuneOut('test'); //messages on test channel will no longer be shown
 * //Note: Remove 'test' channel with app.radio.reset('test')
 * @example <caption>Choose what level gets shown</caption>
 * var app = require('app');
 * app.radio.level('log'); //show all logs
 * app.radio.tuneIn('test'); //no need to create the channel first
 * setInterval(function() {
 *    app.radio.channel('test').trigger('log', 'message');
 *    app.radio.channel('test').trigger('info', 'message');
 *    app.radio.channel('test').trigger('warn', 'message');
 *    app.radio.channel('test').trigger('error', 'message');
 * }, 1000);
 * app.radio.level('none');  //show no logs
 * app.radio.level('error'); //only show 'error' logs
 * app.radio.level('warn');  //show 'error' and 'warn' logs
 * // Note: Unless directly set with level(), the default behavior is to show no logs
 * // Note: Return current logging level with app.radio.level()
 * // Note: Return channels with app.radio.channels()
**/
define(function(require, exports) {
    'use strict';

    var _     = require('lodash');
    var Radio = require('backbone.radio');

    Radio.DEBUG = false;// Show & Hide Backbone.Radio debug messages
    var APP_LOGGING = true;// Show & Hide Application console messages
    var MSG_PREFIX  = '%c APP ❱❱ %c';
    var MSG_TYPES   = ['error', 'warn', 'info', 'log', 'trace'];
    var zipObject   = _.isFunction(_.zipObject) ? _.zipObject : _.object;
    var MSG_DICT    = zipObject(MSG_TYPES, MSG_TYPES.map(function(type, i) {return i;}));

    var STYLE = {
        none:  'background:inherit;color:inherit;',
        error: 'background:red;color:white;',
        warn:  'background:yellow;color:black;',
        info:  'background:blue;color:white;',
        log:   'background:#333;color:white;'
    };

    function consoleMessage(type) {
        return Function.prototype.bind.call(console[type], console, MSG_PREFIX, STYLE[type], STYLE.none);
    }

    var channelMethods = Object.create(null);
    channelMethods.getChannels = function() {
        return Object.keys(Radio._channels);
    };
    channelMethods.level = function(value) {
        if (typeof(value) !== 'undefined') {
            var level;
            if (_.isNumber(value) && value < MSG_TYPES.length) {
                level = value;
            } else if (_.isString(value)) {
                level = _.includes(MSG_TYPES, value) ? MSG_DICT[value] + 1 : 0;
            }
            channelMethods._level = level;
        }
        return channelMethods._level;
    };

    Radio.log = function(channelName, type) {
        type = _.includes(MSG_TYPES, type) ? type : 'log';
        var level = MSG_DICT[type];
        var msg = arguments.length > 2 ? arguments[2] : arguments[1];
        if (level < channelMethods.level()) {
            consoleMessage(type)(`[${channelName}] `, msg, _.now());
        }
    };

    exports.radio = _.extend(Radio, channelMethods);

    MSG_TYPES.forEach(function(type) {
        exports[type] = APP_LOGGING ? consoleMessage(type) : function() {};
    });
});

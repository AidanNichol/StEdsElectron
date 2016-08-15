/* jshint quotmark: false, jquery: true */
/* global window, R */
// var indexBy = require('lodash').indexBy;
// var R = require('./ramda/ramda');
// // var printStackTrace = require('stacktrace-js');
// var exports = module.exports = {};




// Full version of `log` that:
//  * Prevents errors on console methods when no console present.
//  * Exposes a global 'log' function that preserves line numbering and formatting.
  import R from 'ramda';
  var method;
  var noop = function () { };
  var methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
      'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
        console[method] = noop;
    }
  }

export var logR = R.curry(function logR(tag,X) {console.log('UtilService '+tag+':', X); return X;});


  // window.log = function(){

  //   // something cool;
  //   Function.prototype.apply.call(console.log, console, arguments);
  // };

export var getFnName = function getFnName(fn) {
		var f = typeof fn === 'function';
		var s = f && ((fn.name && ['', fn.name]) || fn.toString().match(/function ([^\(]+)/));
		return (!f && 'not a function') || (s && s[1] || 'anonymous');
	};
export var  logError = function(err) {
    console.error(err);
    console.trace();
  };
export var Logit = R.curry(function logit(style,source, tag,X) {
    var Y;
    Y = Array.prototype.slice.call(arguments, 3);
		// if (arguments.length > 4)Y = Array.prototype.slice.call(arguments, 3);
    // else X = [X];
		// var callee = R.head(myStackTrace());
		// if (!callee)logR(tag, X);
		// else
    console.log.apply(console, ['%c%s: %c %s %c ', style, source, style+'font-weight:bold', tag, ''].concat(Y));
		// console.log('%c%s: %c %s %c %O', style, source, style+'font-weight:bold', tag, '', X);
		return X;
	});
export var  logtable = function(title, table) {
        console.groupCollapsed(title);
        console.table(table);
        console.groupEnd(title);
    };

export var logRarray = R.forEach(logR('item'));

export function isUserAuthorized(usersRoles, okRoles) {
  if (!usersRoles)return false;
  if (!Array.isArray(usersRoles))usersRoles = [usersRoles];
  var authorizedRoles = ['_admin', 'admin', ...okRoles];

  console.log('isAuthorized', authorizedRoles, usersRoles, okRoles );
  return [...usersRoles].some((role)=>authorizedRoles.indexOf(role)!==-1);
}

'use strict';

var _ = require('lodash');
if (!Object.is) Object.is = require('object-is');
var bytewise = require('bytewise');
var KindaObject = require('kinda-object');

var KindaStore = KindaObject.extend('KindaStore', function() {
  this.setOptions = function(options) {
    if (!options) options = {};
    this.keyEncoding = options.keyEncoding || 'bytewise';
    this.valueEncoding = options.valueEncoding || 'json';
  };

  this.encode = function(value, encoding) {
    switch (encoding) {
    case 'bytewise':
      return new Buffer(bytewise.encode(value)); // bytewise.encode return a Uint8Array in the browser
    case 'json':
      if (typeof value === 'undefined') return;
      return new Buffer(JSON.stringify(value));
    default:
      throw new Error('unknown encoding');
    }
  };

  this.encodeKey = function(key) {
    if (!key) throw new Error('undefined, null or empty key');
    return this.encode(key, this.keyEncoding);
  };

  this.encodeValue = function(value) {
    if (value == null) return undefined;
    return this.encode(value, this.valueEncoding);
  };

  this.decode = function(value, encoding) {
    switch (encoding) {
    case 'bytewise':
      return bytewise.decode(value);
    case 'json':
      return JSON.parse(value);
    default:
      throw new Error('unknown encoding');
    }
  };

  this.decodeKey = function(key) {
    if (!key) throw new Error('undefined, null or empty key');
    return this.decode(key, this.keyEncoding);
  };

  this.decodeValue = function(value) {
    if (value == null) return undefined;
    return this.decode(value, this.valueEncoding);
  };

  this.getPreviousKey = function(key) {
    if (this.keyEncoding !== 'bytewise')
      throw new Error('unimplemented encoding');
    var keys = _.clone(key);
    if (!keys.length) return keys;
    key = keys.pop();
    key = this._getPreviousKey(key);
    keys.push(key);
    return keys;
  };

  this._getPreviousKey = function(key) {
    if (_.isNumber(key)) {
      return key - 0.000001; // TODO: try to increase precision
    } else if (_.isString(key)) {
      if (!key.length) return key;
      var end = key.substr(-1);
      key = key.substr(0, key.length - 1);
      end = String.fromCharCode(end.charCodeAt(0) - 1);
      end += '\uFFFF';
      return key + end;
    } else {
      return key;
    }
  };

  this.getNextKey = function(key) {
    if (this.keyEncoding !== 'bytewise')
      throw new Error('unimplemented encoding');
    var keys = _.clone(key);
    if (!keys.length) return keys;
    key = keys.pop();
    key = this._getNextKey(key);
    keys.push(key);
    return keys;
  };

  this._getNextKey = function(key) {
    if (_.isNumber(key)) {
      return key + 0.000001; // TODO: try to increase precision
    } else if (_.isString(key)) {
      if (!key.length) return key;
      var end = key.substr(-1);
      key = key.substr(0, key.length - 1);
      end += '\u0001';
      return key + end;
    } else {
      return key;
    }
  };

  this.getEmptyKey = function() {
    if (this.keyEncoding !== 'bytewise')
      throw new Error('unimplemented encoding');
    return [];
  };

  this.getMinimumKey = function() {
    if (this.keyEncoding !== 'bytewise')
      throw new Error('unimplemented encoding');
    return [null];
  };

  this.getMaximumKey = function() {
    if (this.keyEncoding !== 'bytewise')
      throw new Error('unimplemented encoding');
    return [undefined];
  };

  this.normalizeKey = function(key) {
    if (this.keyEncoding !== 'bytewise')
      throw new Error('unimplemented encoding');
    if (!_.isArray(key)) key = [key];
    return key;
  };

  this.concatKeys = function(key1, key2) {
    if (this.keyEncoding !== 'bytewise')
      throw new Error('unimplemented encoding');
    return key1.concat(key2);
  };

  this.normalizeKeySelectors = function(options) {
    options = _.clone(options);

    if (options.hasOwnProperty('value')) {
      if (options.hasOwnProperty('start'))
        throw new Error('invalid key selector');
      if (options.hasOwnProperty('end'))
        throw new Error('invalid key selector');
      options.start = options.value;
      options.end = options.value;
    }

    var key;

    if (options.hasOwnProperty('start')) {
      if (options.hasOwnProperty('startAfter'))
        throw new Error('invalid key selector');
      options.start = this.normalizeKey(options.start);
    }
    if (options.hasOwnProperty('startAfter')) {
      key = this.normalizeKey(options.startAfter);
      key = options.reverse ? this.getPreviousKey(key) : this.getNextKey(key);
      options.start = key;
      delete options.startAfter;
    }
    if (!options.hasOwnProperty('start'))
      options.start = this.getEmptyKey();
    if (options.reverse)
      options.start = this.concatKeys(options.start, this.getMaximumKey());

    if (options.hasOwnProperty('end')) {
      if (options.hasOwnProperty('endBefore'))
        throw new Error('invalid key selector');
      options.end = this.normalizeKey(options.end);
    }
    if (options.hasOwnProperty('endBefore')) {
      key = this.normalizeKey(options.endBefore);
      key = options.reverse ? this.getNextKey(key) : this.getPreviousKey(key);
      options.end = key;
      delete options.endBefore;
    }
    if (!options.hasOwnProperty('end'))
      options.end = this.getEmptyKey();
    if (!options.reverse)
      options.end = this.concatKeys(options.end, this.getMaximumKey());

    if (options.hasOwnProperty('prefix')) {
      var prefix = this.normalizeKey(options.prefix);
      options.start = this.concatKeys(prefix, options.start);
      options.end = this.concatKeys(prefix, options.end);
      delete options.prefix;
    }

    if (options.reverse) {
      var tmp = options.start;
      options.start = options.end;
      options.end = tmp;
    }

    return options;
  };
});

module.exports = KindaStore;

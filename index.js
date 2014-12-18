'use strict';

var Factory = {
  create: function(url, options) {
    if (!url) throw new Error('url is missing');
    if (!options) options = {};
    var pos = url.indexOf(':');
    if (pos === -1) throw new Error('invalid url');
    var protocol = url.substr(0, pos);
    switch (protocol) {
    case 'mysql':
      return require('kinda-store-mysql' + '').create(url, options);
    case 'websql':
      return require('kinda-store-web-sql').create(url, options);
    default:
      throw new Error('unknown protocol');
    }
  }
};

module.exports = Factory;

'use strict';

let Factory = {
  create(options = {}) {
    let url = options.url;
    if (!url) throw new Error('url is missing');
    let pos = url.indexOf(':');
    if (pos === -1) throw new Error('invalid url');
    let protocol = url.substr(0, pos);
    switch (protocol) {
      case 'mysql':
        return require('kinda-mysql-store').create(options);
      case 'websql':
      case 'sqlite':
        return require('kinda-web-sql-store').create(options);
      default:
        throw new Error('unknown protocol');
    }
  }
};

module.exports = Factory;

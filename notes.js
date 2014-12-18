var Store = require('kinda-store');

var store = Store.create('mysql://root:j6d8jdo@localhost/durable');
// options:
//   keyEncoding (default: 'bytewise')
//   valueEncoding (default: 'json')

var key = ['vaults', 'xjd6djd'];

var item = yield store.get(key);

yield store.put(key, { fileCounter: 3 });
// options: createIfMissing, errorIfExists

yield store.del(key);
// options: errorIfMissing

var items = yield store.getMany(keys);
// => [{ key: ..., value: ... }, ...]

yield store.putMany(items);

yield store.delMany(keys);

var items = yield store.getRange({ start: key, limit: 30 });
// options: prefix, start, end, reverse, limit
// startAfter, endBefore

{ prefix: 'users', limit: 10 } // last returned key: 132

{ prefix: 'users', startAfter: '132', limit: 10 }

{ prefix: 'users', reverse: true, limit: 10 } // last returned key: 1200

{ prefix: 'users', startAfter: '1200', reverse: true, limit: 10 }

yield store.delRange({ start: key1, end: key2 });

yield store.transaction(function *(tr) {
  var item = yield tr.get(key);
  item.fileCounter++;
  yield tr.put(key, item);
}.bind(this));

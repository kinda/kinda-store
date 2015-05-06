"use strict";

require('co-mocha');
var assert = require('chai').assert;
var KindaStore = require('./');

suite('KindaStore', function() {
  var store = KindaStore.create('mysql://test@localhost/test');

  suiteTeardown(function *() {
    yield store.delRange();
  });

  test('simple put, get and del', function *() {
    var key = ['users', 'mvila'];
    yield store.put(key, { firstName: 'Manu', age: 42 });
    var user = yield store.get(key);
    assert.deepEqual(user, { firstName: 'Manu', age: 42 });
    var hasBeenDeleted = yield store.del(key);
    assert.isTrue(hasBeenDeleted);
    var user = yield store.get(key, { errorIfMissing: false });
    assert.isUndefined(user);
    hasBeenDeleted = yield store.del(key, { errorIfMissing: false });
    assert.isFalse(hasBeenDeleted);
  });
});

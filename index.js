var Util = require('cheerwe-util');

var Queue = function() {
    this.list = [];
    this._endItem = null;
    this.isRunning = false;
};


Queue.prototype = {
    then: function(fn, callback) {
        if (arguments.length == 1) {
            callback = fn;
            fn = (function(cb) {
                cb && cb
            }).bind(this, callback);
        }

        this.list.push({
            fn: fn,
            callback: callback
        });

        this.run();

        return this;
    },
    run: function() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        var item = this.list.shift();

        if (item) {
            this._runItem(item);
        } else {
            this._runEnd();
        }
    },
    end: function(fn, callback) {
        this._endItem = {
            fn: fn,
            callback: callback
        };
        return this;
    },
    error: function(fn, callback) {
        this._errorItem = {
            fn: fn,
            callback: callback
        };
        return this;
    },
    _runEnd: function() {
        if (this._endItem) {
            this._runItem(this._endItem, true);
        }
    },
    _runError: function(err) {
        if (this._errorItem) {
            var fn = this._endItem.fn;
            this._errorItem.fn = fn.bind(this, err);
            this._runItem(this._errorItem, true);
        }
    },
    _runItem: function(item, isEnd) {

        var callback = (function(callback, isEnd, err) {
            var ret = true;
            if (callback) {
                var args = Array.prototype.slice.call(arguments);
                args.shift(); //callback
                args.shift(); //isEnd
                args.shift(); //error

                if (!err) {
                    ret = callback.apply(item.scope || this, args);
                }
            }
            this.isRunning = false;

            if (err) {
                this._runError(err);
            } else {
                if (!isEnd) {
                    //如果上一个callback的执行结果不是false，则继续执行下一个异步
                    if (ret !== false) {
                        this.run();
                    } else {
                        this._runEnd();
                    }
                }
            }

        }).bind(this, item.callback, isEnd);

        item && item.fn && item.fn(callback);
    }
};

Queue.then = function(fn, callback) {
    var ins = new Queue();
    ins.then(fn, callback);

    return ins;
};
module.exports = Queue;

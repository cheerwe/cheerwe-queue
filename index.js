var Util = require('cheerwe-util');

var Queue = function() {
    this.list = [];
    this._endItem = null;
    this.isRunning = false;
};


Queue.prototype = {
    add: function(fn, callback) {
        if (fn && !callback) {
            callback = fn;
            fn = (function(cb) {
                cb && cb();
            }).bind(this, callback);
        }

        this.list.push({
            fn: fn,
            callback: callback
        });

        return this;
    },
    then: function(fn, callback) {
        this.add(fn, callback);

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
            _fn: fn,
            callback: callback
        };
        return this;
    },
    error: function(fn, callback) {
        this._errorItem = {
            fn: fn,
            _fn: fn,
            callback: callback
        };
        return this;
    },
    _runEnd: function(ret) {
        if (this._endItem) {
            var fn = this._endItem._fn;
            this._endItem.fn = fn.bind(this, ret === false ? false : true);
            this._runItem(this._endItem, true);
        }
    },
    _runError: function(err) {
        if (this._errorItem) {
            var fn = this._errorItem._fn;
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
                        this._runEnd(false);
                    }
                }
            }

        }).bind(this, item.callback, isEnd);

        try {
            item && item.fn && item.fn(callback);
        } catch (err) {
            this._runError(err);
        }
    }
};

Queue.then = function(fn, callback) {
    var ins = new Queue();
    ins.then(fn, callback);

    return ins;
};

Queue.add = function(fn, callback) {
    var ins = new Queue();
    ins.add(fn, callback);
    return ins;
}
module.exports = Queue;
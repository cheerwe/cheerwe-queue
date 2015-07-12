# Cheerwe-Queue

一款及简易的将一部操作变同步流程的小工具

## Demo

‘’‘
var WeQueue=require('cheerwe-queue');

WeQueue
    .then(function(){
        //you can return false direct to end

    })
    .then(function(){
        //you can return false direct to end

    })
    .then(function(){
        //you can return false direct to end
    })
    .end(function(){
        //the last function
    })
    .error(function(){
        //when errors catch on then
    })


’‘’

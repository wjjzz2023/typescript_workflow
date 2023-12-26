"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
var workflow02_ts_1 = require("./workflow.ts");
var userTask = /** @class */ (function () {
    function userTask() {
    }

    userTask.prototype.execute = function (executionContext) {
        console.log(executionContext.get("id"));
        return this;
    };
    return userTask;
}());
var map = new Map();
map.set("id", 12);
map.set("sharedData", "共享数据");
var container01 = workflow02_ts_1.TaskQueueContainer.create("test01");
var mainTaskQueue = new workflow02_ts_1.TaskQueue();
mainTaskQueue.enqueue(new workflow02_ts_1.SimpleTask('Main Task 1'))
    .enqueue(new workflow02_ts_1.SimpleTask('Main Task 2'))
    .enqueue(new workflow02_ts_1.SimpleTask("王建民03"))
    .enqueue(new userTask());
var switchTask = new workflow02_ts_1.SwitchTask(function () {
    return "case3";
}, new Map([
    ["case1", new workflow02_ts_1.TaskQueue().enqueue(new workflow02_ts_1.SimpleTask("wjm"))],
    ["case2", new workflow02_ts_1.TaskQueue().enqueue(new workflow02_ts_1.SimpleTask("zz"))],
    ["case3", new workflow02_ts_1.TaskQueue().enqueue(new workflow02_ts_1.SimpleTask("jj"))],
    // Add more cases as needed
]));
mainTaskQueue.enqueue(switchTask);
var ifElseTask = new workflow02_ts_1.IfElseTask(function () {
    return false;
}, function () {
    return new workflow02_ts_1.TaskQueue().enqueue(new workflow02_ts_1.SimpleTask("if else is true"));
}, function () {
    return new workflow02_ts_1.TaskQueue().enqueue(new workflow02_ts_1.SimpleTask("if else is false"));
});
mainTaskQueue.enqueue(ifElseTask);
container01.addTaskQueue(mainTaskQueue);
//执行工作流
container01.executeAll(map);

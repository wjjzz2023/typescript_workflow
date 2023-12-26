import {TaskQueueContainer, TaskQueue, SimpleTask, Task, SwitchTask, IfElseTask,AspectTask} from "./workflow02.ts";

class userTask implements Task {
    execute(executionContext: Map<string, any>): Task {
        console.log(executionContext.get("id"))
        return this;
    }
}

const map: Map<string, any> = new Map();
map.set("id", 12)
map.set("sharedData", "共享数据")
const container01 = TaskQueueContainer.create("test01");
const mainTaskQueue = new TaskQueue();
mainTaskQueue.enqueue(
    new SimpleTask('Main Task 1'))
    .enqueue(new SimpleTask('Main Task 2'))
    .enqueue(new SimpleTask("王建民03"))
    .enqueue(new userTask())
const switchTask = new SwitchTask(() => "case3", new Map([
    ["case1", new TaskQueue().enqueue(new SimpleTask("wjm"))],
    ["case2", new TaskQueue().enqueue(new SimpleTask("zz"))],
    ["case3", new TaskQueue().enqueue(new SimpleTask("jj"))],
    // Add more cases as needed
]));
mainTaskQueue.enqueue(switchTask)
const ifElseTask = new IfElseTask(() => false,
    () => new TaskQueue().enqueue(new SimpleTask("if else is true")),
    () => new TaskQueue().enqueue(
        new AspectTask(new SimpleTask("if else is false"),excutation=>{
            console.log("this before execute:"+excutation.get("id"))
            return true
        }))
    )
mainTaskQueue.enqueue(ifElseTask)


//加载流程定义
container01.addTaskQueue(mainTaskQueue)
//执行工作流
container01.executeAll(map)
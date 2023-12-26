# Workflow Executor

## Introduction

The Workflow Executor is a simple TypeScript library that enables the execution of front-end workflows. It provides a set of classes representing different types of tasks, task queues, and a container for managing the execution context.

## Classes

### 1. `SimpleTask`

Represents a simple task that logs information to the console.

### 2. `TaskQueue`

A queue that holds a sequence of tasks and allows their execution in order.

### 3. `IfElseTask`

A task that executes one of two task queues based on a provided condition.

### 4. `WhileTask`

A task that repeatedly executes a task queue as long as a specified condition is true.

### 5. `SwitchTask`

A task that executes one of several task queues based on matching cases.

### 6. `AspectTask`

An enhanced task that provides a way to attach before and after execution aspects to a task.

### 7. `TaskQueueContainer`

A container for managing multiple task queues and their execution contexts.

## Usage

```typescript
// Import necessary classes from your workflow library
import { TaskQueueContainer, TaskQueue, SimpleTask, Task, SwitchTask, IfElseTask, AspectTask } from "./workflow02.ts";

// Define a custom task that implements the Task interface
class UserTask implements Task {
    execute(executionContext: Map<string, any>): Task {
        console.log(executionContext.get("id"));
        return this;
    }
}

// Create an initial execution context
const map: Map<string, any> = new Map();
map.set("id", 12);
map.set("sharedData", "Shared Data");

// Create a TaskQueueContainer with a specific name
const container01 = TaskQueueContainer.create("test01");

// Create and enqueue tasks in the main task queue
const mainTaskQueue = new TaskQueue();
mainTaskQueue
    .enqueue(new SimpleTask('Main Task 1'))
    .enqueue(new SimpleTask('Main Task 2'))
    .enqueue(new SimpleTask("王建民03"))
    .enqueue(new UserTask());

// Create a SwitchTask with multiple cases
const switchTask = new SwitchTask(() => "case3", new Map([
    ["case1", new TaskQueue().enqueue(new SimpleTask("wjm"))],
    ["case2", new TaskQueue().enqueue(new SimpleTask("zz"))],
    ["case3", new TaskQueue().enqueue(new SimpleTask("jj"))],
    // Add more cases as needed
]));

// Enqueue the SwitchTask in the main task queue
mainTaskQueue.enqueue(switchTask);

// Create an IfElseTask with conditions and task queues
const ifElseTask = new IfElseTask(
    () => false,
    () => new TaskQueue().enqueue(new SimpleTask("if else is true")),
    () => new TaskQueue().enqueue(
        new AspectTask(new SimpleTask("if else is false"), execution => {
            console.log("this before execute:" + execution.get("id"));
            return true;
        })
    )
);

// Enqueue the IfElseTask in the main task queue
mainTaskQueue.enqueue(ifElseTask);

// Add the main task queue to the container
container01.addTaskQueue(mainTaskQueue);

// Execute the workflow by providing the initial execution context
container01.executeAll(map);


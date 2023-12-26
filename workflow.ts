/**
 * Author: Wang Jianmin
 * Date: 2023-12-25
 * Functional: Implementation of frontend workflow execution
 * Version: Version 1.0 (Snapshot)
 */


/**
 * Represents a unit of work that can be executed within a workflow.
 */
export interface Task {
    /**
     * Executes the task with the provided execution context.
     * @param executionContext - The context in which the task is executed.
     * @returns The updated task instance.
     */
    execute(executionContext: Map<string, any>): Task;
}

/**
 * Represents a simple task that logs information to the console.
 * This task is primarily used for demonstrating workflow functionality.
 */
export class SimpleTask implements Task {
    private name: string;

    /**
     * Creates a new instance of SimpleTask with a specified name.
     * @param name - The name of the task.
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * Executes the simple task by logging information to the console.
     * @param executionContext - The context in which the task is executed.
     * @returns The updated SimpleTask instance.
     */
    execute(executionContext: Map<string, any>): Task {
        console.log(`Executing task: ${this.name}`);
        // Access and update shared data from execution context
        const sharedData = executionContext.get('sharedData');
        // executionContext.set("sharedData", `${sharedData}===${this.name}`)
        let id = executionContext.get("id") + "";
        let i = parseInt(id);
        ++i;
        executionContext.set("id", i)
        console.log(`Shared data: ${sharedData}===${i}`);
        return this;
    }
}

/**
 * Represents a container for organizing and executing a sequence of tasks.
 */
export class TaskQueue {
    private queue: Task[] = [];

    /**
     * Enqueues a task in the task queue.
     * @param task - The task to be enqueued.
     * @returns The updated TaskQueue instance.
     */
    enqueue(task: Task): TaskQueue {
        this.queue.push(task);
        return this;
    }

    /**
     * Dequeues a task from the task queue.
     * @returns The dequeued task or undefined if the queue is empty.
     */
    dequeue(): Task | undefined {
        return this.queue.shift()
    }

    /**
     * Dequeues and executes tasks in the task queue until it is empty.
     * @param executionContext - The context in which the tasks are executed.
     */
    executeAll(executionContext: Map<string, any>): void {
        while (this.queue.length > 0) {
            const task = this.dequeue();
            if (task) {
                task.execute(executionContext);
            }
        }
    }

    /**
     * Creates a clone of the current task queue.
     * @returns A new TaskQueue instance with the same tasks.
     */
    clone(): TaskQueue {
        const clonedQueue = new TaskQueue();
        // Copy tasks from the current queue to the cloned queue
        clonedQueue.queue = [...this.queue];

        return clonedQueue;
    }
}

/**
 * Represents a task that conditionally executes one of two task queues based on a boolean condition.
 */
export class IfElseTask implements Task {
    private condition: () => boolean;
    private ifTaskQueueFactory: () => TaskQueue;
    private elseTaskQueueFactory: () => TaskQueue;

    /**
     * Creates a new instance of IfElseTask with the specified condition and task queues.
     * @param condition - The condition determining which task queue to execute.
     * @param ifTaskQueueFactory - A factory function for the "if" task queue.
     * @param elseTaskQueueFactory - A factory function for the "else" task queue.
     */
    constructor(condition: () => boolean, ifTaskQueueFactory: () => TaskQueue, elseTaskQueueFactory: () => TaskQueue) {
        this.condition = condition;
        this.ifTaskQueueFactory = ifTaskQueueFactory;
        this.elseTaskQueueFactory = elseTaskQueueFactory;
    }

    /**
     * Executes the IfElseTask by conditionally executing one of the task queues.
     * @param executionContext - The context in which the task is executed.
     * @returns The updated IfElseTask instance.
     */
    execute(executionContext: Map<string, any>): Task {
        console.log(executionContext);
        if (this.condition()) {
            this.ifTaskQueueFactory().executeAll(executionContext);
        } else {
            this.elseTaskQueueFactory().executeAll(executionContext);
        }

        return this;
    }
}

/**
 * Represents a task that conditionally executes a body task queue for multiple iterations based on a condition.
 */
export class WhileTask implements Task {
    private condition: () => boolean;
    private bodyTaskQueueFactory: () => TaskQueue;

    /**
     * Creates a new instance of WhileTask with the specified condition and body task queue.
     * @param condition - The condition determining whether to continue the loop.
     * @param bodyTaskQueueFactory - A factory function for the body task queue.
     */
    constructor(condition: () => boolean, bodyTaskQueueFactory: () => TaskQueue) {
        this.condition = condition;
        this.bodyTaskQueueFactory = bodyTaskQueueFactory;
    }

    /**
     * Executes the WhileTask by iteratively executing the body task queue.
     * @param executionContext - The context in which the task is executed.
     * @returns The updated WhileTask instance.
     */
    execute(executionContext: Map<string, any>): Task {
        console.log("execute while")
        console.log(this.bodyTaskQueueFactory())
        console.log(executionContext);
        while (this.condition()) {
            const bodyTaskQueue = this.bodyTaskQueueFactory().clone(); // Create a new instance for each iteration
            bodyTaskQueue.executeAll(executionContext);
        }

        return this;
    }
}


/**
 * Represents a task that conditionally executes one of multiple task queues based on a switch case logic.
 */
export class SwitchTask implements Task {
    private condition: () => any;
    private cases: Map<any, TaskQueue>;

    /**
     * Creates a new instance of SwitchTask with the specified condition and task queues for each case.
     * @param condition - The condition determining which case to execute.
     * @param cases - A map of case values to factory functions for the corresponding task queues.
     */
    constructor(condition: () => any, cases: Map<any, TaskQueue>) {
        this.condition = condition;
        this.cases = cases;
    }

    /**
     * Executes the SwitchTask by conditionally executing one of the task queues based on the switch case logic.
     * @param executionContext - The context in which the task is executed.
     * @returns The updated SwitchTask instance.
     */
    execute(executionContext: Map<string, any>): Task {
        const conditionValue = this.condition();

        if (this.cases.has(conditionValue)) {
            const caseTaskQueue = this.cases.get(conditionValue);
            if (caseTaskQueue) {
                caseTaskQueue.executeAll(executionContext);
            }
        } else {
            // Handle the default case or provide custom logic
            console.log("No matching case found.");
        }

        return this;
    }
}


/**
 * Represents a task that wraps another task and allows the injection of custom behavior before and after execution.
 */
//Task的切面class，对Task进行封装
export class AspectTask implements Task {
    private task: Task;
    private beforeExecute?: (executionContext: Map<string, any>) => boolean;
    private afterExecute?: (executionContext: Map<string, any>) => void;

    /**
     * Creates a new instance of AspectTask with the specified task and optional before/after execution callbacks.
     * @param task - The original task to be wrapped.
     * @param beforeExecute - A callback function to be executed before the original task.
     * @param afterExecute - A callback function to be executed after the original task.
     */
    constructor(task: Task, beforeExecute?: (executionContext: Map<string, any>) => boolean, afterExecute?: (executionContext: Map<string, any>) => void) {
        this.task = task;
        this.beforeExecute = beforeExecute;
        this.afterExecute = afterExecute;
    }

    /**
     * Executes the AspectTask, allowing injection of custom behavior before and after the original task.
     * @param executionContext - The context in which the task is executed.
     * @returns The updated AspectTask instance.
     */
    execute(executionContext: Map<string, any>): Task {
        // Execute before aspect
        if (this.beforeExecute && !this.beforeExecute(executionContext)) {
            // If beforeExecute returns false, skip the execution of the original task
            return this;
        }
        // Execute the original task
        this.task.execute(executionContext);

        // Execute after aspect
        if (this.afterExecute)
            this.afterExecute(executionContext);
        return this;
    }
}

/**
 * Represents a container for organizing and executing a sequence of tasks with a specific execution context.
 */
export class TaskQueueContainer {
    /**
     * Gets the name of the task queue container.
     */
    get name() {
        return this._name;
    }

    /**
     * Sets the name of the task queue container.
     */
    set name(value) {
        this._name = value;
    }

    private static containers: Map<string, TaskQueueContainer> = new Map();
    private taskQueues: TaskQueue[] = [];
    static executionContexts: Map<string, Map<string, any>> = new Map();
    private _name;

    /**
     * Creates a new instance of TaskQueueContainer with a specified name and optional initial execution context.
     * @param name - The name of the container.
     * @param initialExecutionContext - The initial execution context to be used by the container.
     */
    private constructor(name: string, initialExecutionContext?: Map<string, any>) {
        // 在构造函数中初始化 executionContexts
        this._name = name;
        // 如果提供了初始的 executionContext，则使用提供的值，否则创建一个新的 Map
        if (initialExecutionContext) {
            TaskQueueContainer.executionContexts.set(name, initialExecutionContext);
        } else {
            TaskQueueContainer.executionContexts.set(name, new Map())
        }

    }

    /*
        * Static factory method to create an instance of TaskQueueContainer.
        * @param name - The name of the container.
        * @param initialExecutionContext - Optional initial execution context for the container.
        * @returns The created or existing TaskQueueContainer instance.
        */
    static create(name: string, initialExecutionContext?: Map<string, any>): TaskQueueContainer {
        if (!TaskQueueContainer.containers.has(name)) {
            TaskQueueContainer.containers.set(name, new TaskQueueContainer(name, initialExecutionContext));
        }
        return TaskQueueContainer.containers.get(name)!;
    }

    // 根据名字获取 ExecutionContext 实例
    getExecutionContext(): Map<string, Object> | undefined {
        return TaskQueueContainer.executionContexts.get(this._name);
    }

    // 添加 TaskQueue 到容器
    addTaskQueue(taskQueue: TaskQueue): void {
        this.taskQueues.push(taskQueue);
    }

    // 执行容器中所有 TaskQueue 的任务
    executeAll(executionContext: Map<string, any>): void {
        this.taskQueues.forEach((taskQueue) => {
            if (executionContext) {
                taskQueue.executeAll(executionContext);
            }
        });
    }
}

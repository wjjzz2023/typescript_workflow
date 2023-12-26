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
// Example usage of Workflow Executor

import { TaskQueueContainer, SimpleTask, IfElseTask, WhileTask } from 'workflow-executor';

// Create a container with a specific name and initial execution context
const container = TaskQueueContainer.create('exampleContainer');

// Create and add a task queue to the container
const mainTaskQueue = new TaskQueue();
container.addTaskQueue(mainTaskQueue);

// Create and enqueue simple tasks
mainTaskQueue
  .enqueue(new SimpleTask('Task 1'))
  .enqueue(new SimpleTask('Task 2'))
  .enqueue(new SimpleTask('Task 3'));

// Create an IfElseTask with two task queues
const ifElseTask = new IfElseTask(
  true,
  () => new TaskQueue().enqueue(new SimpleTask('If Task')),
  () => new TaskQueue().enqueue(new SimpleTask('Else Task'))
);

// Enqueue the IfElseTask
mainTaskQueue.enqueue(ifElseTask);

// Create and enqueue a WhileTask
const whileTask = new WhileTask(
  () => true,
  () => new TaskQueue().enqueue(new SimpleTask('While Body Task'))
);

mainTaskQueue.enqueue(whileTask);

// Execute all task queues in the container
container.executeAll();

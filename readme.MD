You can use a single queue.
```js
import { Queue, STATUS } from 'queue-rxjs';

const queue = new Queue();

queue.getSubject().subscribe({
    next: ({ metadata, status }) => {
		if (status === STATUS.ERROR) {
			return queue.retry();
		}
		// ...
	},
});

queue.insert(() => new Promise((resolve, reject) => {
	// ...
}), 'metadata first action');

queue.insert(() => new Promise((resolve, reject) => {
	// ...
}), 'metadata second action');

```

You can use a queue manager to use multiple queues
```js
import { QueueManager } from 'queue-rxjs';

const queueManager = new QueueManager();

queueManager.getSubject().subscribe({
    next: ({ status, statuses, metadata }) => {
        // ...
	},
});

queueManager.insert(() => new Promise((resolve, reject) => {
	// ...
}), 'metadata first action defaullt queue');

queueManager.insert(() => new Promise((resolve, reject) => {
	// ...
}), 'metadata first action on custom queue', 'myCustom');

```
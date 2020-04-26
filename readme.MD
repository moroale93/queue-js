```js
import Queue from './src/queue';
import STATUS from './src/status';

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
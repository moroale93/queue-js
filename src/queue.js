import { Subject } from 'rxjs';

import STATUS from './status.js';

export default class Queue {
	constructor(name = 'default') {
		this.statusSubject = new Subject();
		this.name = name;
		this.queue = [];
		this.status = false;
	}

	getSubject() {
		return this.statusSubject;
	}

	insert(promise, metadata) {
		this.queue.push({
			metadata,
			promise,
		});
		if (this.status === STATUS.DONE) {
			this.status = STATUS.PROGRESS;
		}
		this._executeQueue();
	}

	retry() {
		if (this.queue.length > 0 && this.status === STATUS.ERROR) {
			this._precessNextItems();
		}
	}

	_precessNextItems () {
		this.status = STATUS.PROGRESS;
		this.statusSubject.next({
			queueName: this.name,
			status: this.status,
			metadata: this.queue[0].metadata,
		});
		this.queue[0].promise()
			.then(value => {
				this.queue.shift();
				if (this.queue.length !== 0) {
					this._precessNextItems();
					return value;
				}
				this.status = STATUS.DONE;
				this.statusSubject.next({
					queueName: this.name,
					status: this.status,
				});
				return value;
			})
			.catch(err => {
				this.status = STATUS.ERROR;
				this.statusSubject.next({
					queueName: this.name,
					status: this.status,
					metadata: this.queue[0].metadata,
				});
				return err;
			});
	};

	_executeQueue() {
		if (
			[STATUS.PROGRESS, STATUS.ERROR].indexOf(this.status) !== -1
			|| this.queue.length === 0
		) {
			return false;
		}
		this._precessNextItems();
		return true;
	}
}

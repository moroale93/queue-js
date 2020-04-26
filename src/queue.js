import SubjectObject from './subject-object.js';
import STATUS from './status.js';
import { DEFAULT_QUEUE_NAME } from './consts.js';

export default class Queue extends SubjectObject {
	constructor(name = DEFAULT_QUEUE_NAME) {
		super();
		this.name = name;
		this.queue = [];
		this.status = STATUS.DONE;
		this.metadata = undefined;
	}

	getMetadata() {
		if (this.queue.length) {
			return this.queue[0].metadata;
		}
		return undefined;
	}

	insert(promise, metadata) {
		this.queue.push({
			metadata,
			promise,
		});
		if (this.status === STATUS.DONE) {
			this.status = STATUS.PROGRESS;
			this._precessNextItems();
		}
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
}

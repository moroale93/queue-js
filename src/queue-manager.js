import SubjectObject from './subject-object.js';
import { DEFAULT_QUEUE_NAME } from './consts';
import STATUS from './status.js';
import Queue from './queue';

export class QueueManager extends SubjectObject {
    constructor() {
        super();
        this.queues = {};
        this.status = STATUS.DONE;
    }

    _onQueueUpdate() {
        const queuesObj = Object.values(this.queues).reduce((result, current) => {
            let status = current.status;
            if (result.status === STATUS.ERROR || (current.status === STATUS.DONE && result.status === STATUS.DONE)) {
                status = result.status;
            }
            return {
                status,
                statuses: {
                    ...result.statuses,
                    [current.name]: current.status,
                },
                metadata: {
                    ...result.metadata,
                    [current.name]: current.queue.length ? current.queue[0].metadata : undefined,
                },
            };
        }, {
            status: STATUS.DONE,
            statuses: {},
            metadata: {},
        });
        this.statusSubject.next(queuesObj);
    }

    insert(promise, metadata, queueName = DEFAULT_QUEUE_NAME) {
        if (!this.queues[queueName]) {
            this.queues[queueName] = new Queue(queueName);
            const self = this;
            this.queues[queueName].getSubject().subscribe({
                next: this._onQueueUpdate.bind(self),
            });
        }
        this.queues[queueName].insert(promise, metadata);
    }

    retry() {
        Object.values(this.queues).forEach(queue => {
            if (queue.status === STATUS.ERROR) {
                queue.retry();
            }
        });
    }
}

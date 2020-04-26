import { Subject } from 'rxjs';

export default class SubjectObject {
	constructor() {
		this.statusSubject = new Subject();
	}

	getSubject() {
		return this.statusSubject;
	}
}

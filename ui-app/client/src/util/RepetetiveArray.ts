import { isNullValue } from '@fincity/kirun-js';

export default class RepetetiveArray<T> implements Iterable<T> {
	private defaultValue: T | undefined;
	private inMap: Map<number, T>;
	private _length: number;

	constructor() {
		this.inMap = new Map<number, T>();
		this._length = 0;
	}

	[Symbol.toStringTag](): string {
		return '' + this.toArray();
	}

	set length(value: number) {
		if (value < 0) {
			throw new Error('Invalid array length');
		}

		if (value < this._length) {
			for (let i = this._length - 1; i >= value; i--) {
				this.remove(i);
			}
			return;
		}
	}

	get length(): number {
		return this._length;
	}

	public toString(): string {
		return '' + this.toArray();
	}

	[Symbol.iterator](): Iterator<T, any, undefined> {
		let index = 0;
		const array = this.toArray();
		return {
			next: () => {
				if (index < array.length) {
					const done = index === this._length;
					return { value: array[index++], done };
				}
				return { value: undefined, done: true };
			},
		};
	}

	public push(value: T): void {
		if (isNullValue(this.defaultValue)) {
			this.defaultValue = value;
			this._length = 1;
			return;
		}

		if (this.defaultValue === value) {
			this._length++;
			return;
		}

		this.inMap.set(this._length, value);
		this._length++;

		this.reShuffle();
	}

	private reShuffle(): void {
		if (this.inMap.size < this._length / 2) return;

		const valueCountMap = Array.from(this.inMap.values()).reduce((a, c) => {
			if (a.has(c)) {
				a.set(c, a.get(c)! + 1);
			} else {
				a.set(c, 1);
			}
			return a;
		}, new Map<T, number>());

		const keyCount = Array.from(valueCountMap.entries()).reduce(
			(a: [T | undefined, number], c) => (a[1] < c[1] ? c : a),
			[undefined, 0],
		);

		if (valueCountMap.size > this._length / 3) {
			return;
		}

		if (keyCount[1] < this._length / 2) return;

		const entries = Array.from(this.inMap.entries()).sort((a, b) => a[0] - b[0]);

		const newEntries: [number, T][] = [];
		let currentNumber = 0;
		for (const element of entries) {
			while (currentNumber < element[0]) {
				newEntries.push([currentNumber, this.defaultValue!]);
				currentNumber++;
			}
			if (element[1] === keyCount[0]) {
				currentNumber++;
				continue;
			}

			newEntries.push([currentNumber, element[1]]);
			currentNumber++;
		}

		this.inMap = new Map<number, T>(newEntries);
		this.defaultValue = keyCount[0]!;
	}

	public get(index: number): T {
		if (index < this._length) {
			return this.inMap.get(index) ?? this.defaultValue!;
		}
		throw new Error('Index out of bounds');
	}

	public set(index: number, value: T): void {
		if (index < this._length) {
			if (index === this._length) {
				this.push(value);
				return;
			}
			if (value === this.defaultValue) {
				if (this.inMap.has(index)) {
					this.inMap.delete(index);
				}
			} else {
				this.inMap.set(index, value);
				this.reShuffle();
			}
			return;
		}
		throw new Error('Index out of bounds');
	}

	public insert(index: number, value: T): void {
		if (index > this._length) throw new Error('Index out of bounds');

		if (index === this._length) {
			this.push(value);
			return;
		}

		for (let i = this._length - 1; i >= index; i--) {
			if (!this.inMap.has(i)) continue;

			this.inMap.set(i + 1, this.inMap.get(i)!);
			this.inMap.delete(i);
		}

		if (value !== this.defaultValue) {
			this.inMap.set(index, value);
			this.reShuffle();
		}
		this._length++;
	}

	public remove(index: number): void {
		if (index >= this._length) throw new Error('Index out of bounds');

		if (index === this._length - 1) {
			this._length--;
			this.inMap.delete(index);
			return;
		}

		for (let i = index; i < this._length - 1; i++) {
			if (!this.inMap.has(i + 1)) continue;

			this.inMap.set(i, this.inMap.get(i + 1)!);
			this.inMap.delete(i + 1);
		}

		this._length--;
	}

	public clear(): void {
		this._length = 0;
		this.inMap.clear();
	}

	public toArray(): T[] {
		const arr: T[] = [];
		for (let i = 0; i < this._length; i++) {
			arr.push(this.get(i) ?? this.defaultValue!);
		}
		return arr;
	}

	public forEach(callbackfn: (value: T, index: number, array: T[]) => void): void {
		for (let i = 0; i < this._length; i++) {
			callbackfn(this.get(i) ?? this.defaultValue!, i, this.toArray());
		}
	}

	public map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[] {
		const arr: U[] = [];
		for (let i = 0; i < this._length; i++) {
			arr.push(callbackfn(this.get(i) ?? this.defaultValue!, i, this.toArray()));
		}
		return arr;
	}

	public filter(callbackfn: (value: T, index: number, array: T[]) => boolean): T[] {
		const arr: T[] = [];
		for (let i = 0; i < this._length; i++) {
			const value = this.get(i) ?? this.defaultValue!;
			if (callbackfn(value, i, this.toArray())) {
				arr.push(value);
			}
		}
		return arr;
	}

	public reduce<U>(
		callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U,
		initialValue: U,
	): U {
		let acc = initialValue;
		for (let i = 0; i < this._length; i++) {
			acc = callbackfn(acc, this.get(i) ?? this.defaultValue!, i, this.toArray());
		}
		return acc;
	}

	public getDefaultValue(): T | undefined {
		return this.defaultValue;
	}

	public getInternalMap(): Map<number, T> {
		return this.inMap;
	}

	public toJSON(): T[] {
		return this.toArray();
	}
}

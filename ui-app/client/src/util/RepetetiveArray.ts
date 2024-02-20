import { isNullValue } from '@fincity/kirun-js';

export default class RepetetiveArray<T> {
	private defaultValue: T | undefined;
	private inMap: Map<number, T>;
	private internalSize: number;

	constructor() {
		this.inMap = new Map<number, T>();
		this.internalSize = 0;
	}

	public push(value: T): void {
		if (isNullValue(this.defaultValue)) {
			this.defaultValue = value;
			this.internalSize = 1;
			return;
		}

		if (this.defaultValue === value) {
			this.internalSize++;
			return;
		}

		this.inMap.set(this.internalSize, value);
		this.internalSize++;

		this.reShuffle();
	}

	private reShuffle(): void {
		if (this.inMap.size < this.internalSize / 2) return;

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

		if (valueCountMap.size > this.internalSize / 3) {
			return;
		}

		if (keyCount[1] < this.internalSize / 2) return;

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
		if (index < this.internalSize) {
			return this.inMap.get(index) ?? this.defaultValue!;
		}
		throw new Error('Index out of bounds');
	}

	public size(): number {
		return this.internalSize;
	}

	public set(index: number, value: T): void {
		if (index < this.internalSize) {
			if (index === this.internalSize) {
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
		if (index > this.internalSize) throw new Error('Index out of bounds');

		if (index === this.internalSize) {
			this.push(value);
			return;
		}

		for (let i = this.internalSize - 1; i >= index; i--) {
			if (!this.inMap.has(i)) continue;

			this.inMap.set(i + 1, this.inMap.get(i)!);
			this.inMap.delete(i);
		}

		if (value !== this.defaultValue) {
			this.inMap.set(index, value);
			this.reShuffle();
		}
		this.internalSize++;
	}

	public remove(index: number): void {
		if (index >= this.internalSize) throw new Error('Index out of bounds');

		if (index === this.internalSize - 1) {
			this.internalSize--;
			this.inMap.delete(index);
			return;
		}

		for (let i = index; i < this.internalSize - 1; i++) {
			if (!this.inMap.has(i + 1)) continue;

			this.inMap.set(i, this.inMap.get(i + 1)!);
			this.inMap.delete(i + 1);
		}

		this.internalSize--;
	}

	public clear(): void {
		this.internalSize = 0;
		this.inMap.clear();
	}

	public toArray(): T[] {
		const arr: T[] = [];
		for (let i = 0; i < this.internalSize; i++) {
			arr.push(this.get(i) ?? this.defaultValue!);
		}
		return arr;
	}

	public forEach(callbackfn: (value: T, index: number, array: T[]) => void): void {
		for (let i = 0; i < this.internalSize; i++) {
			callbackfn(this.get(i) ?? this.defaultValue!, i, this.toArray());
		}
	}

	public map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[] {
		const arr: U[] = [];
		for (let i = 0; i < this.internalSize; i++) {
			arr.push(callbackfn(this.get(i) ?? this.defaultValue!, i, this.toArray()));
		}
		return arr;
	}

	public filter(callbackfn: (value: T, index: number, array: T[]) => boolean): T[] {
		const arr: T[] = [];
		for (let i = 0; i < this.internalSize; i++) {
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
		for (let i = 0; i < this.internalSize; i++) {
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
}

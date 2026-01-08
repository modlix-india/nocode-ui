// A U B
export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
	return new Set([...a, ...b]);
}

// A ∩ B
export function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
	return new Set([...a].filter(x => b.has(x)));
}

// A - B
export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
	return new Set([...a].filter(x => !b.has(x)));
}

// A ⊆ B
export function isSubset<T>(a: Set<T>, b: Set<T>): boolean {
	return [...a].every(x => b.has(x));
}

// A ⊂ B
export function isProperSubset<T>(a: Set<T>, b: Set<T>): boolean {
	return isSubset(a, b) && !isSubset(b, a);
}

// A ⊇ B
export function isSuperset<T>(a: Set<T>, b: Set<T>): boolean {
	return isSubset(b, a);
}

// A ⊃ B
export function isProperSuperset<T>(a: Set<T>, b: Set<T>): boolean {
	return isProperSubset(b, a);
}

// A ⊄ B
export function isDisjoint<T>(a: Set<T>, b: Set<T>): boolean {
	return intersection(a, b).size === 0;
}

// A = B
export function isEqual<T>(a: Set<T>, b: Set<T>): boolean {
	return isSubset(a, b) && isSubset(b, a);
}

// A ≠ B
export function isNotEqual<T>(a: Set<T>, b: Set<T>): boolean {
	return !isEqual(a, b);
}

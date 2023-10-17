export function moveUp(array: any[], index: number): any[] {
	array = [...array];
	if (index === 0) {
		array.push(array.shift());
		return array;
	}
	const temp = array[index];
	array[index] = array[index - 1];
	array[index - 1] = temp;

	return array;
}

export function moveDown(array: any[], index: number): any[] {
	array = [...array];
	if (index === array.length - 1) {
		array.unshift(array.pop());
		return array;
	}
	const temp = array[index];
	array[index] = array[index + 1];
	array[index + 1] = temp;
	return array;
}

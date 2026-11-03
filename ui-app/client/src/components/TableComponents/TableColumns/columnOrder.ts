// A user's saved column order holds positions (0, 1, 2, ...) for the columns that existed when it
// was saved. A column added to the page later has no position there, only its design displayOrder,
// and the two numbers are not comparable. So the saved columns keep their saved order, and each
// column the saved order does not know goes right after its nearest design neighbour that it does.
export function orderColumnKeys(
	columns: Array<{ key: string; displayOrder?: number }>,
	savedOrder: { [key: string]: number },
): string[] {
	const design = [...columns]
		.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
		.map(c => c.key);

	const result = design
		.filter(k => savedOrder[k] !== undefined)
		.sort((a, b) => savedOrder[a] - savedOrder[b]);

	design.forEach((key, i) => {
		if (savedOrder[key] !== undefined) return;
		let at = 0;
		for (let j = i - 1; j >= 0; j--) {
			const pos = result.indexOf(design[j]);
			if (pos !== -1) {
				at = pos + 1;
				break;
			}
		}
		result.splice(at, 0, key);
	});

	return result;
}

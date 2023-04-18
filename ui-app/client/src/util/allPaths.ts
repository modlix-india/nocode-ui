export function allPaths(
	prefix: string,
	obj: any,
	paths: Set<string> = new Set<string>(),
): Set<string> {
	if (Array.isArray(obj)) {
		obj.forEach((item, index) => {
			paths.add(`${prefix}[${index}]`);
			if (typeof item === 'object' && item !== null)
				allPaths(`${prefix}[${index}]`, item, paths);
		});
	} else if (typeof obj === 'object' && obj !== null) {
		Object.keys(obj).forEach(key => {
			paths.add(`${prefix}.${key}`);
			if (typeof obj[key] === 'object' && obj[key] !== null)
				allPaths(`${prefix}.${key}`, obj[key], paths);
		});
	}

	return paths;
}

export function allPathsFilter(
	paths: Set<string>,
	filter: string,
	limit: number = -1,
): Array<string> {
	const filtered = new Array<string>();

	const index = filter.lastIndexOf('.');
	let startWith = '';
	if (index !== -1) {
		startWith = filter.substring(0, index);
		filter = filter.substring(index + 1);
	}

	if (startWith) {
		for (const path of paths) {
			if (path.startsWith(startWith)) {
				if (path.includes(filter)) filtered.push(path);
			} else if (path.includes(filter)) {
				filtered.push(path);
			}

			if (filtered.length === limit) break;
		}
	} else {
		for (const path of paths) {
			if (path.includes(filter)) {
				filtered.push(path);
				if (filtered.length === limit) break;
			}
		}
	}

	return filtered.sort();
}

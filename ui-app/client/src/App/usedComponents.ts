const usedSet = new Set<string>();

const registeredComponents = new Map<string, () => void>();
let lastAdded = Date.now();

export const usedComponents = {
	using: (name: string) => {
		if (usedSet.has(name)) return;
		lastAdded = Date.now();
		usedSet.add(name);
		registeredComponents.get(name)?.();
	},
	register: (name: string, fn: () => void) => {
		registeredComponents.set(name, fn);
	},
	deRegister: (name: string) => {
		registeredComponents.delete(name);
	},
	lastAdded: () => lastAdded,
	used: (name: string) => usedSet.has(name),
};

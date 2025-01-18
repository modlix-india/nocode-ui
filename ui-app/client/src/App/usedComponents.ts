const usedSet = new Set<string>();
const rendered = document.getElementById('_rendered');
if (rendered) {
	const comps = (rendered.getAttribute('data-used-components') ?? '').split(',');
	comps.forEach(e => usedSet.add(e));
}

const registeredComponents = new Map<string, () => void>();
let lastAdded = Date.now();
const globalListeners: Array<(usedSet: Set<string>) => void> = new Array();

const deRegisterGlobalListener = (fn: (usedSet: Set<string>) => void) => {
	const index = globalListeners.indexOf(fn);
	if (index == -1) return;
	globalListeners.splice(index, 1);
};
export const usedComponents = {
	using: (name: string) => {
		if (usedSet.has(name)) return;
		lastAdded = Date.now();
		usedSet.add(name);
		registeredComponents.get(name)?.();
		globalListeners.forEach(fn => fn(usedSet));
	},
	register: (name: string, fn: () => void) => {
		registeredComponents.set(name, fn);
	},
	registerGloblalListener: (fn: (usedSet: Set<string>) => void) => {
		globalListeners.push(fn);
		return () => deRegisterGlobalListener(fn);
	},
	deRegister: (name: string) => {
		registeredComponents.delete(name);
	},
	deRegisterGlobalListener,
	lastAdded: () => lastAdded,
	used: (name: string) => usedSet.has(name),
};

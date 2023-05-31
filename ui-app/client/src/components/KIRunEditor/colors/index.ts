export function generateColor(...str: string[]) {
	return SIDE_COLORS[generateNumber(str.join(''))];
}

export function generateNumber(str: string) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	if (hash < 0) hash = -hash;
	hash += 12;
	return hash % SIDE_COLORS.length;
}

export const SIDE_COLORS = [
	'679ae6',
	'00b9f6',
	'00d4e7',
	'00e8bf',
	'9af58f',
	'7887da',
	'8973c9',
	'985eb2',
	'a24698',
	'a62b79',
	'2567ae',
	'663f00',
	'887455',
	'404756',
	'a4abbd',
	'e27892',
	'a74460',
	'26605c',
	'002a66',

	'328c86',
	'73fac9',
	'2fc193',
	'008a60',
	'7b91bc',

	'e57d41',
	'00b1ab',
	'bea5a9',
	'00c0f8',
	'00e0ea',
	'28ad70',
	'004bb6',
	'508984',
	'005a55',
	'0e2624',

	'948bfb',
	'fc648f',
	'00498b',
	'd9a21b',
	'407ac2',
	'055ba0',
	'003e7e',
	'00235f',
	'00174f',
	'81b2ff',
	'558ad5',
	'6497e3',
];

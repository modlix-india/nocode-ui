const romanMatrix: Array<Array<string | number>> = [
	[1000, 'M', 'm'],
	[900, 'CM', 'cm'],
	[500, 'D', 'd'],
	[400, 'CD', 'cd'],
	[100, 'C', 'c'],
	[90, 'XC', 'xc'],
	[50, 'L', 'l'],
	[40, 'XL', 'xl'],
	[10, 'X', 'x'],
	[9, 'IX', 'ix'],
	[5, 'V', 'v'],
	[4, 'IV', 'iv'],
	[1, 'I', 'i'],
];
export const getRoman = (num: number, isUpperCase = true) => {
	if (num === 0) {
		return '';
	}
	for (let i = 0; i < romanMatrix.length; i++) {
		if (num >= romanMatrix[i][0]) {
			const number: number = romanMatrix[i][0] as number;
			const temp: string =
				(isUpperCase ? romanMatrix[i][1] : romanMatrix[i][2]) + getRoman(num - number)!;
			return temp;
		}
	}
};

export const getAlphaNumeral = (num: number, isUpperCase = true): string => {
	if (num <= 0) return '';
	const rem = num % 26;
	const add = isUpperCase ? 'A'.charCodeAt(0) - 1 : 'a'.charCodeAt(0) - 1;
	let alphaNumeral: string = String.fromCharCode((rem === 0 ? 26 : rem) + add);
	if (num <= 26) {
		return alphaNumeral;
	}
	return getAlphaNumeral(Math.floor(num / 26), isUpperCase) + alphaNumeral;
};

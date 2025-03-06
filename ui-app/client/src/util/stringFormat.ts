const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];
const FORMATTING_FUNCTIONS = new Map<string, (str: string) => string>([
	['STRING', str => str],
	[
		'UTC_TO_MM/DD/YYYY',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
				return `${prependZero(date.getMonth() + 1, 2)}/${prependZero(
					date.getDate(),
					2,
				)}/${date.getFullYear()}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	[
		'UTC_TO_MM/DD/YYYY_HH:MM',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
				return `${prependZero(date.getMonth() + 1, 2)}/${prependZero(
					date.getDate(),
					2,
				)}/${date.getFullYear()} ${prependZero(date.getHours(), 2)}:${prependZero(
					date.getMinutes(),
					2,
				)}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	[
		'UTC_TO_MM/DD/YYYY_HH:MM:SS',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(pi * 1000);
				return `${prependZero(date.getMonth() + 1, 2)}/${prependZero(
					date.getDate(),
					2,
				)}/${date.getFullYear()} ${prependZero(date.getHours(), 2)}:${prependZero(
					date.getMinutes(),
					2,
				)}:${prependZero(date.getSeconds(), 2)}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	[
		'UTC_TO_MM/DD/YYYY_HH:MM:SS.SSS',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(pi * 1000);
				return `${prependZero(date.getMonth() + 1, 2)}/${prependZero(
					date.getDate(),
					2,
				)}/${date.getFullYear()} ${prependZero(date.getHours(), 2)}:${prependZero(
					date.getMinutes(),
					2,
				)}:${prependZero(date.getSeconds(), 2)}.${prependZero(date.getMilliseconds(), 3)}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	[
		'UTC_TO_YYYY-MM-DD',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(pi * 1000);
				return `${date.getFullYear()}-${prependZero(date.getMonth() + 1, 2)}-${prependZero(
					date.getDate(),
					2,
				)}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	[
		'UTC_TO_YYYY-MM-DD_HH:MM',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(pi * 1000);
				return `${date.getFullYear()}-${prependZero(date.getMonth() + 1, 2)}-${prependZero(
					date.getDate(),
					2,
				)} ${prependZero(date.getHours(), 2)}:${prependZero(date.getMinutes(), 2)}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	[
		'UTC_TO_YYYY-MM-DD_HH:MM:SS',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(pi * 1000);
				return `${date.getFullYear()}-${prependZero(date.getMonth() + 1, 2)}-${prependZero(
					date.getDate(),
					2,
				)} ${prependZero(date.getHours(), 2)}:${prependZero(
					date.getMinutes(),
					2,
				)}:${prependZero(date.getSeconds(), 2)}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	[
		'UTC_TO_YYYY-MM-DD_HH:MM:SS.SSS',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(pi * 1000);
				return `${date.getFullYear()}-${prependZero(date.getMonth() + 1, 2)}-${prependZero(
					date.getDate(),
					2,
				)} ${prependZero(date.getHours(), 2)}:${prependZero(
					date.getMinutes(),
					2,
				)}:${prependZero(date.getSeconds(), 2)}.${prependZero(date.getMilliseconds(), 3)}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	[
		'UTC_TO_MONTH_DD,YYYY',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(pi * 1000);
				return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	[
		'UTC_TO_MONTH_DD,YYYY_HH:MM',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(pi * 1000);
				return `${
					MONTHS[date.getMonth()]
				} ${date.getDate()}, ${date.getFullYear()} ${prependZero(
					date.getHours(),
					2,
				)}:${prependZero(date.getMinutes(), 2)}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	[
		'UTC_TO_MONTH_DD,YYYY_HH:MM:SS',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(pi * 1000);
				return `${
					MONTHS[date.getMonth()]
				} ${date.getDate()}, ${date.getFullYear()} ${prependZero(
					date.getHours(),
					2,
				)}:${prependZero(date.getMinutes(), 2)}:${prependZero(date.getSeconds(), 2)}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	[
		'UTC_TO_MONTH_DD,YYYY_HH:MM:SS.SSS',
		str => {
			try {
				const pi = parseInt(str);
				if (isNaN(pi)) return str;
				const date = new Date();
				date.setTime(pi * 1000);
				return `${
					MONTHS[date.getMonth()]
				} ${date.getDate()}, ${date.getFullYear()} ${prependZero(
					date.getHours(),
					2,
				)}:${prependZero(date.getMinutes(), 2)}:${prependZero(
					date.getSeconds(),
					2,
				)}.${prependZero(date.getMilliseconds(), 3)}`;
			} catch (e) {
				console.error(e);
			}
			return str;
		},
	],
	['SYSTEM_NUMBER_FORMAT', numberFormattingCurry(navigator.language)],
	['IN_NUMBER_FORMAT', numberFormattingCurry('en-IN')],
	['US_NUMBER_FORMAT', numberFormattingCurry('en-US')],
	['EU_NUMBER_FORMAT', numberFormattingCurry('de-DE')],
	['FR_NUMBER_FORMAT', numberFormattingCurry('fr-FR')],
	['LI_NUMBER_FORMAT', numberFormattingCurry('de-LI')],
	[
		'FILE_SIZE',
		str => {
			let size = parseInt(str);
			const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
			let i = 0;
			if (isNaN(size)) return str;
			while (size > 1024) {
				size /= 1024;
				i++;
			}
			let fixedString = size.toFixed(2);
			if (fixedString.endsWith('.00')) fixedString = fixedString.slice(0, -3);
			return `${fixedString} ${sizes[i]}`;
		},
	],
]);

function numberFormattingCurry(format: string) {
	const formatter = new Intl.NumberFormat(format, { style: 'decimal' });

	return (str: any) => {
		let numb = typeof str === 'number' ? str : parseFloat(str);
		if (isNaN(numb)) return str;
		return formatter.format(numb) ?? str;
	};
}

export function formatString(str: string, format: string): string {
	if (!format || !str) return str;
	return FORMATTING_FUNCTIONS.get(format)?.(str) ?? str;
}

function prependZero(num: number, size: number): string {
	let s = num + '';

	while (s.length < size) s = '0' + s;
	return s;
}

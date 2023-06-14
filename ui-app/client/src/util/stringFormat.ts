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
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
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
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
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
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
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
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
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
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
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
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
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
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
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
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
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
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
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
				const date = new Date();
				date.setTime(parseInt(str) * 1000);
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
]);

export function formatString(str: string, format: string): string {
	return FORMATTING_FUNCTIONS.get(format)?.(str) ?? str;
}

function prependZero(num: number, size: number): string {
	let s = num + '';

	while (s.length < size) s = '0' + s;
	return s;
}

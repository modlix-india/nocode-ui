import { useCallback } from 'react';
import { getValidDate } from '../utils/dateFormatting';

/**
 * Hook for parsing date values using display and storage formats.
 * Tries display format first, then storage format.
 *
 * @param displayDateFormat - Primary format for displaying dates
 * @param storageFormat - Secondary format for storing dates (optional)
 * @returns A memoized parse function that returns Date or undefined
 */
export function useDateParsing(
	displayDateFormat: string,
	storageFormat?: string,
): (value: string | number | undefined) => Date | undefined {
	return useCallback(
		(value: string | number | undefined): Date | undefined => {
			if (!value) return undefined;

			// Try display format first
			const displayParsed = getValidDate(value, displayDateFormat);
			if (displayParsed) return displayParsed;

			// Try storage format if different
			if (storageFormat && storageFormat !== displayDateFormat) {
				const storageParsed = getValidDate(value, storageFormat);
				if (storageParsed) return storageParsed;
			}

			return undefined;
		},
		[displayDateFormat, storageFormat],
	);
}

/**
 * Hook variant that returns both the parse function and format info.
 * Useful when you need access to the formats as well.
 */
export function useDateParsingWithFormats(displayDateFormat: string, storageFormat?: string) {
	const parseDate = useDateParsing(displayDateFormat, storageFormat);

	return {
		parseDate,
		displayDateFormat,
		storageFormat: storageFormat ?? displayDateFormat,
	};
}


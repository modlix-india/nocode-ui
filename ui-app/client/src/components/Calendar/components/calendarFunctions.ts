/**
 * Calendar functions - Barrel export for backward compatibility.
 * 
 * All functions have been reorganized into focused utility files under ../utils/
 * This file re-exports them to maintain backward compatibility with existing imports.
 */

// Date formatting utilities
export {
	toFormat,
	getValidDate,
	processRelativeOrAbsoluteDate,
	parseRelativeDate,
	makeDateFromParts,
} from '../utils/dateFormatting';

// Date validation utilities
export {
	validateRangesAndSetData,
	validateWithProps,
	parseDateWithFormatsFromProps,
} from '../utils/dateValidation';

// Date computation utilities
export {
	zeroHourDate,
	computeMinMaxDates,
	computeWeekNumberOfYear,
} from '../utils/dateComputation';

// Style helper utilities
export {
	getStyleObjectCurry,
	addToToggleSetCurry,
	removeFromToggleSetCurry,
} from '../utils/styleHelpers';

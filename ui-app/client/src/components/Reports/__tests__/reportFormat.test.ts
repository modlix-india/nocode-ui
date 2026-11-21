import {
	formatCell,
	formatMoney,
	formatNumber,
	formatPercent,
	formatMeasure,
	labelOf,
	updatedLabel,
	visibleColumns,
} from '../reportFormat';

describe('number formatting from the catalog locale', () => {
	test('compact follows the locale: lakh / crore for en-IN, K / M for en-US', () => {
		expect(formatNumber(45000000, { locale: 'en-IN', compact: true })).toBe('4.5Cr');
		expect(formatNumber(150000, { locale: 'en-IN', compact: true })).toBe('1.5L');
		expect(formatNumber(45000000, { locale: 'en-US', compact: true })).toBe('45M');
		expect(formatNumber(1500, { locale: 'en-US', compact: true })).toBe('1.5K');
	});

	test('full grouping follows the locale', () => {
		expect(formatNumber(4500000, { locale: 'en-IN' })).toBe('45,00,000');
		expect(formatNumber(4500000, { locale: 'en-US' })).toBe('4,500,000');
	});

	test('money uses the column currency; INR is not tied to any locale in code', () => {
		expect(formatMoney(45000000, 'INR', { locale: 'en-IN', compact: true })).toBe('₹4.5Cr');
		expect(formatMoney(45000000, 'INR', { locale: 'en-US', compact: true })).toBe('₹45M');
		expect(formatMoney(1234.5, 'USD', { locale: 'en-US' })).toBe('$1,235');
		expect(formatMoney(12.5, 'USD', { locale: 'en-US' })).toBe('$12.5');
		// No currency: a plain number, never a guessed one.
		expect(formatMoney(1000, undefined, { locale: 'en-US' })).toBe('1,000');
	});

	test('numberFormat style and decimals', () => {
		expect(
			formatNumber(1234.5678, {
				locale: 'en-US',
				numberFormat: { style: 'full', decimals: 2 },
			}),
		).toBe('1,234.57');
		expect(
			formatNumber(1234.5678, {
				locale: 'en-US',
				numberFormat: { style: 'full', decimals: 0 },
			}),
		).toBe('1,235');
		expect(
			formatNumber(0.234, {
				locale: 'en-US',
				numberFormat: { style: 'percent', decimals: 1 },
			}),
		).toBe('23.4%');
		expect(
			formatNumber(2500000, {
				locale: 'en-US',
				numberFormat: { style: 'compact', decimals: 2 },
			}),
		).toBe('2.5M');
		// A PERCENT column is already 0 to 100.
		expect(formatMeasure(42, { key: 'p', format: 'PERCENT' }, {}, { locale: 'en-US' })).toBe(
			'42%',
		);
		expect(formatPercent(12.345, { locale: 'en-US', numberFormat: { decimals: 2 } })).toBe(
			'12.35%',
		);
	});

	test('a split result names its currency on the row', () => {
		const col = { key: 'value', kind: 'MEASURE', format: 'MONEY', currency: 'INR' };
		expect(formatCell({ value: 1000, currency: 'USD' }, col, { locale: 'en-US' })).toBe(
			'$1,000',
		);
	});

	test('empty values', () => {
		expect(formatNumber(null)).toBe('-');
		expect(formatMoney('', 'INR')).toBe('-');
	});
});

describe('cells, labels, columns', () => {
	test('a dimension with a lookup shows its label', () => {
		const col = { key: 'rm', kind: 'DIMENSION' };
		expect(formatCell({ rm: 'u1', rm_label: 'Asha' }, col)).toBe('Asha');
		expect(formatCell({ rm: 'u1' }, col)).toBe('u1');
		expect(labelOf({ m: '2026-11-01', m_label: 'Nov 2026' }, 'm')).toBe('Nov 2026');
	});

	test('a date dimension without a label is formatted as a calendar day', () => {
		expect(
			formatCell({ d: '2026-11-17' }, { key: 'd', kind: 'DATE' }, { locale: 'en-GB' }),
		).toBe('17 Nov 2026');
	});

	test('hidden and _label companion columns are not shown', () => {
		const cols = visibleColumns({
			columns: [
				{ key: 'rm' },
				{ key: 'rm_label', hidden: true },
				{ key: 'n', kind: 'MEASURE' },
			],
		});
		expect(cols.map(c => c.key)).toEqual(['rm', 'n']);
	});

	test('Updated label', () => {
		const d = new Date(2026, 10, 17, 9, 5);
		expect(updatedLabel(d)).toBe('Updated 09:05');
		expect(updatedLabel(undefined)).toBe('');
	});
});

test('money with no currency from the runner falls back to the catalog currency', () => {
	expect(
		formatMeasure(
			2500,
			{ key: 'v', format: 'MONEY' },
			{},
			{ locale: 'en-US', currency: 'INR' },
		),
	).toBe('₹2,500');
	expect(
		formatMeasure(
			2500,
			{ key: 'v', format: 'MONEY', currency: 'USD' },
			{},
			{ locale: 'en-US', currency: 'INR' },
		),
	).toBe('$2,500');
});

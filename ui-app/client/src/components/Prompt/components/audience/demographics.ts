import type { AgeRange, DemoOptions, DemoState } from './types';

// Never blank: set_demographics replaces the whole spec, so gaps would wipe filters.
export function seedDemo(
	values: Record<string, any> | undefined,
	o: DemoOptions | undefined,
): DemoState {
	const ages: AgeRange[] = values?.age_ranges ?? [];
	const [first, ...extraAges] = ages;
	const incomes: string[] = values?.income_ranges ?? [];
	const allGenders = (o?.genders ?? []).map(g => g.value);
	const allParental = (o?.parental_statuses ?? []).map(p => p.value);
	const bands = o?.income_ranges ?? [];
	return {
		minAge: first ? String(first.min_age) : String(o?.age_mins?.[0] ?? 18),
		maxAge: first?.max_age ? String(first.max_age) : '',
		genders: values?.genders?.length ? values.genders : allGenders,
		incomeFrom: incomes[0] ?? bands[0]?.value ?? '',
		incomeTo: incomes.length
			? incomes[incomes.length - 1]
			: (bands[bands.length - 1]?.value ?? ''),
		parental: values?.parental_statuses?.length ? values.parental_statuses : allParental,
		unknown: values?.include_undetermined ?? {},
		extraAges,
	};
}

export const incomeIndex = (o: DemoOptions, value: string) =>
	o.income_ranges.findIndex(i => i.value === value);

// The bands between the two ends, inclusive.
export function incomeSpan(o: DemoOptions, from: string, to: string): string[] {
	if (!from) return [];
	const start = incomeIndex(o, from);
	const end = to ? incomeIndex(o, to) : start;
	return o.income_ranges.slice(start, end + 1).map(i => i.value);
}

// The shapes craft.py's audience_review block sends.

export interface AudSection {
	key: string;
	label: string;
	// 'reach' adds, 'narrow' subtracts, 'custom' is built in chat. Sent by craft.py.
	group?: 'reach' | 'custom' | 'narrow';
	columns: string[];
	rows: Record<string, any>[];
	actions?: string[];
	help?: string; // what this kind of segment means, shown under its name
	members?: MemberGroup[]; // custom segments only — editable until the campaign launches
	mix_help?: string;
	values?: Record<string, any>; // demographics only — the raw spec behind the display rows
	options?: DemoOptions; // demographics only
}

// Sent by craft.py - a second copy of the enums here would drift.
export interface DemoOptions {
	dimensions: { field: string; label: string; help: string; unknown_help: string }[];
	age_mins: number[];
	age_maxes: number[];
	income_ranges: { value: string; label: string }[]; // top band first — a span runs down this list
	genders: { value: string; label: string }[];
	parental_statuses: { value: string; label: string }[];
}

export interface AgeRange {
	min_age: number;
	max_age?: number;
}

export interface MemberGroup {
	ref: string;
	label: string;
	terms: { keyword: string; volume: number }[];
	urls: string[];
	apps: string[];
	help: Record<string, string>;
	warning: string;
	editable: boolean; // false once Google holds it — our update path is not built
}

export interface Segment {
	ref: string;
	label: string;
	kind: string;
	path: string[];
	targeted?: boolean; // already in the audience, shown rather than removed
	recommended?: boolean; // the agent chose it, so it carries a reason
}

export interface DemoState {
	// As in Google's editor, "no narrowing" is every box ticked - so empty seeds as all.
	minAge: string;
	maxAge: string; // '' = 65+, the open end
	genders: string[];
	incomeFrom: string;
	incomeTo: string;
	parental: string[];
	// Per dimension, keyed by its DemographicSpec field. Absent means Google's default, ON.
	unknown: Record<string, boolean>;
	// The editor shows one span; the model allows several, which must survive an edit.
	extraAges: AgeRange[];
}

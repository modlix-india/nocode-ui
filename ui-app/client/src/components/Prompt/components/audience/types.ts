// The shapes craft.py's audience_review block sends. Kept together so the panel's parts can
// share them without importing each other.

export interface AudSection {
	key: string;
	label: string;
	columns: string[];
	rows: Record<string, any>[];
	actions?: string[];
	help?: string; // what this kind of segment actually means, shown on the info icon
	members?: MemberGroup[]; // custom segments only — editable until the campaign launches
	mix_help?: string;
	values?: Record<string, any>; // demographics only — the raw spec behind the display rows
	options?: DemoOptions; // demographics only
}

// Sent by craft.py, not declared here — a second copy of the enums that validate these
// would drift silently.
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
	targeted?: boolean; // browse only — already in the audience, shown rather than removed
}

export interface DemoState {
	// Mirrors Google's editor: every control is always shown, and "no narrowing" is every box
	// ticked rather than an absent one. An empty list in the saved spec means exactly that,
	// so it seeds as all-selected.
	minAge: string;
	maxAge: string; // '' = 65+, the open end
	genders: string[];
	incomeFrom: string;
	incomeTo: string;
	parental: string[];
	// Per dimension, keyed by its DemographicSpec field. Absent means Google's default, ON.
	unknown: Record<string, boolean>;
	// Age ranges beyond the first. The editor shows one span; the model allows several, and
	// editing something else must not drop the ones it cannot show.
	extraAges: AgeRange[];
}

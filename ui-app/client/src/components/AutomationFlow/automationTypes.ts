/**
 * The Automation document, its catalog, a run and a check report, as the core
 * service serves them (`/api/core/automations`, `/api/core/eventRuns/automations`).
 *
 * Everything is optional on purpose: the component draws whatever half-made
 * document it is handed (a draft the agent is still writing, a template with
 * blanks), so nothing here may assume a field is present.
 */

export type NodeType = 'ACTION' | 'WAIT' | 'CHECK' | 'SPLIT' | 'JOIN' | 'END';

export interface ConditionLeaf {
	field: string;
	operator: string;
	value?: any;
	toValue?: any;
	negate?: boolean;
}

export interface ConditionGroup {
	operator: 'AND' | 'OR';
	conditions: Array<ConditionGroup | ConditionLeaf>;
	negate?: boolean;
}

export type Condition = ConditionGroup | ConditionLeaf;

export interface TriggerRef {
	key: string;
	filter?: ConditionGroup;
}

export interface AutomationNode {
	type: NodeType;
	title?: string;
	// ACTION
	action?: string;
	params?: Record<string, any>;
	onFail?: 'STOP' | 'CONTINUE';
	// WAIT
	for?: string;
	until?: string;
	untilEvent?: TriggerRef;
	timeout?: string;
	// CHECK
	condition?: ConditionGroup;
	[key: string]: any;
}

export interface Transition {
	from: string;
	to: string;
	branch?: string;
}

export interface AutomationDoc {
	name?: string;
	title?: string;
	appCode?: string;
	clientCode?: string;
	paused?: boolean;
	isTemplate?: boolean;
	category?: string;
	trigger?: TriggerRef;
	entry?: { subjectPath?: string; oncePerSubject?: boolean };
	exitWhen?: Array<TriggerRef>;
	start?: string;
	nodes?: Record<string, AutomationNode>;
	transitions?: Array<Transition>;
	[key: string]: any;
}

export interface OptionsRef {
	namespace: string;
	name: string;
}

export interface CatalogField {
	name: string;
	label: string;
	type?: string;
	options?: OptionsRef;
}

export interface CatalogTrigger {
	key: string;
	title: string;
	sentence: string;
	description?: string;
	category?: string;
	subject?: string;
	subjectPath?: string;
	fields?: Array<CatalogField>;
}

export interface CatalogParam {
	name: string;
	label: string;
	type?: string;
	required?: boolean;
	options?: OptionsRef;
	/** A fixed list to pick from (a built-in action's, such as the app's notifications). */
	choices?: PickOption[];
	variables?: boolean;
}

export interface CatalogOutput {
	name: string;
	label: string;
	type?: string;
}

export interface CatalogAction {
	key: string;
	title: string;
	sentence: string;
	builtIn?: boolean;
	/** False for an app function the app does not offer to automations (a builder's catalog only). */
	offered?: boolean;
	category?: string;
	params?: Array<CatalogParam>;
	outputs?: Array<CatalogOutput>;
	idempotent?: boolean;
}

export interface Catalog {
	appCode?: string;
	triggers?: Array<CatalogTrigger>;
	actions?: Array<CatalogAction>;
}

export type RunStatus = 'RUNNING' | 'WAITING' | 'DONE' | 'FAILED' | 'CANCELLED';

export type RunLogStatus =
	'STARTED' | 'DONE' | 'FAILED' | 'WAITING' | 'RETRY' | 'TIMED_OUT' | 'HAPPENED' | 'CANCELLED';

export interface RunLogEntry {
	node?: string;
	status: RunLogStatus | string;
	at?: string | number;
	until?: string | number;
	branch?: string;
	error?: string;
}

export interface AutomationRun {
	id?: string;
	automation?: string;
	status?: RunStatus | string;
	subject?: string;
	waits?: Record<string, { kind?: string; until?: string | number }>;
	log?: Array<RunLogEntry>;
	context?: { trigger?: any; steps?: any };
	test?: boolean;
	draft?: boolean;
	error?: string;
}

export interface CheckIssue {
	code?: string;
	node?: string;
	message: string;
}

export interface CheckReport {
	ok?: boolean;
	errors?: Array<CheckIssue>;
	warnings?: Array<CheckIssue>;
}

/** An option a picker offers, as an options function answers it. */
export interface PickOption {
	label: string;
	value: any;
}

/** A value a param or a condition may refer to, offered by label in "Insert". */
export interface Variable {
	path: string;
	/** What a sentence shows: "the message was read". */
	label: string;
	/** The step an output comes from, added by pickers to tell two outputs apart. */
	group?: string;
	type?: string;
	options?: OptionsRef;
}

/** The key the WHEN card is selected under. Never a node key: node keys are `stepN`-like. */
export const TRIGGER_KEY = '__trigger';

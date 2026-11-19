import { AutomationDoc } from '../automationTypes';
import { canEndAt, canMove, insertAt, moveNode, nextKey, removeNode, updateNode } from '../editOps';
import { BranchItem, CardItem, FlowItem, GotoItem, layoutAutomation, Seq } from '../layout';
import { fromPeriod, parsePeriod, periodToWords, toPeriod } from '../period';
import { cardRun, issuesByNode, runView, runWords } from '../runState';
import { sampleCatalog, sampleDoc, sampleRun } from '../sampleAutomation';
import {
	allVariables,
	cardPlainText,
	conditionToWords,
	fillSentence,
	nodeCard,
	triggerCard,
	variablesFor,
} from '../sentences';

/** A sequence as a compact string: "step1 step2 IF(step3)[step4 | step5]>step6 step6". */
function shape(seq: Seq): string {
	return seq.items.map(itemShape).join(' ');
}
function itemShape(it: FlowItem): string {
	if (it.kind === 'goto') return `->${(it as GotoItem).target}`;
	if (it.kind === 'card') return (it as CardItem).key;
	const b = it as BranchItem;
	const lanes = b.lanes.map(l => shape(l.seq) + (l.closes ? '' : '!')).join(' | ');
	return `${b.type === 'CHECK' ? 'IF' : 'SPLIT'}(${b.key})[${lanes}]${b.mergeKey ? `>${b.mergeKey}` : ''}`;
}

describe('period', () => {
	it('parses and words ISO periods', () => {
		expect(parsePeriod('P2D')).toMatchObject({ days: 2 });
		expect(parsePeriod('PT3H')).toMatchObject({ hours: 3 });
		expect(parsePeriod('P1DT12H')).toMatchObject({ days: 1, hours: 12 });
		expect(parsePeriod('P')).toBeUndefined();
		expect(parsePeriod('2 days')).toBeUndefined();
		expect(periodToWords('P2D')).toBe('2 days');
		expect(periodToWords('P1D')).toBe('1 day');
		expect(periodToWords('PT30M')).toBe('30 minutes');
		expect(periodToWords('P1DT12H')).toBe('1 day and 12 hours');
		expect(periodToWords('P1W')).toBe('1 week');
	});

	it('round trips the number and unit the wait panel edits', () => {
		expect(toPeriod(2, 'days')).toBe('P2D');
		expect(toPeriod(3, 'hours')).toBe('PT3H');
		expect(toPeriod(45, 'minutes')).toBe('PT45M');
		expect(fromPeriod('P2D')).toEqual({ amount: 2, unit: 'days' });
		expect(fromPeriod('PT48H')).toEqual({ amount: 2, unit: 'days' });
		expect(fromPeriod('PT90M')).toEqual({ amount: 90, unit: 'minutes' });
		expect(fromPeriod('PT3H')).toEqual({ amount: 3, unit: 'hours' });
		expect(fromPeriod(undefined)).toEqual({ amount: 1, unit: 'days' });
	});
});

describe('sentences', () => {
	const doc = sampleDoc();
	const catalog = sampleCatalog();
	const vars = allVariables(doc, catalog);

	it('fills a catalog sentence with chips, showing a path by its label', () => {
		const segs = fillSentence(
			'send the WhatsApp template {template} to {to}',
			{ template: 'welcome', to: '{{trigger.leadName}}' },
			vars,
		);
		expect(segs).toEqual([
			{ text: 'send the WhatsApp template ' },
			{ text: 'welcome', chip: true },
			{ text: ' to ' },
			{ text: 'Lead name', chip: true },
		]);
	});

	it('shows an unfilled param as an empty chip named by its label', () => {
		const segs = fillSentence('create a task {title}', {}, vars, { title: 'Title' });
		expect(segs[1]).toEqual({ text: 'Title', chip: true, empty: true });
	});

	it('uses option labels when known', () => {
		const segs = fillSentence('send {template}', { template: 't1' }, vars, {}, (name, v) =>
			name === 'template' && v === 't1' ? 'Welcome to Skyline' : undefined,
		);
		expect(segs[1].text).toBe('Welcome to Skyline');
	});

	it('words a condition', () => {
		expect(
			conditionToWords(
				{
					operator: 'AND',
					conditions: [
						{ field: 'trigger.stage', operator: 'EQUALS', value: 'Won' },
						{ field: 'trigger.amount', operator: 'GREATER_THAN', value: 1000 },
					],
				},
				vars,
			),
		).toBe('Stage is Won and Amount is more than 1000');
		expect(
			conditionToWords(
				{
					operator: 'AND',
					conditions: [{ field: 'steps.step1.read', operator: 'IS_TRUE' }],
				},
				vars,
			),
		).toBe('the message was read');
		expect(
			conditionToWords(
				{
					operator: 'AND',
					conditions: [
						{ field: 'trigger.stage', operator: 'NOT_EQUALS', value: 'Lost' },
						{
							operator: 'OR',
							conditions: [
								{
									field: 'trigger.amount',
									operator: 'BETWEEN',
									value: 1,
									toValue: 5,
								},
								{ field: 'trigger.phone', operator: 'IS_NULL' },
							],
						},
					],
				},
				vars,
			),
		).toBe('Stage is not Lost and (Amount is between 1 and 5 or Phone is empty)');
	});

	it('reads every card type', () => {
		expect(cardPlainText(triggerCard(doc, catalog, vars))).toBe('When a deal is created');
		expect(triggerCard(doc, catalog, vars).detail).toBe('where Stage is Won');
		expect(cardPlainText(nodeCard(doc, catalog, 'step1', vars))).toBe(
			'Send the WhatsApp template welcome to Phone',
		);
		expect(cardPlainText(nodeCard(doc, catalog, 'step2', vars))).toBe(
			'Wait until the WhatsApp message is read, at most 2 days',
		);
		expect(cardPlainText(nodeCard(doc, catalog, 'step3', vars))).toBe(
			'If the message was read',
		);
		expect(cardPlainText(nodeCard(doc, catalog, 'step6', vars))).toBe('End');
		const waits: AutomationDoc = {
			nodes: {
				a: { type: 'WAIT', for: 'P2D' },
				b: { type: 'WAIT', until: '{{trigger.visitAt}}' },
				c: { type: 'ACTION', action: 'x:unknown', title: 'Do the thing' },
				d: { type: 'SPLIT' },
			},
			trigger: { key: 'deal.created' },
		};
		const v2 = allVariables(waits, catalog);
		expect(cardPlainText(nodeCard(waits, catalog, 'a', v2))).toBe('Wait 2 days');
		expect(cardPlainText(nodeCard(waits, catalog, 'b', v2))).toBe('Wait until Visit time');
		expect(cardPlainText(nodeCard(waits, catalog, 'c', v2))).toBe('Do the thing');
		expect(cardPlainText(nodeCard(waits, catalog, 'd', v2))).toBe('At the same time');
	});

	it('offers trigger fields plus the outputs of earlier steps only', () => {
		const at4 = variablesFor(doc, catalog, 'step4').map(v => v.path);
		expect(at4).toContain('trigger.leadName');
		expect(at4).toContain('steps.step1.messageId');
		expect(at4).not.toContain('steps.step5.messageId');
		expect(at4).not.toContain('steps.step4.taskId');
		const atTrigger = variablesFor(doc, catalog).map(v => v.path);
		expect(atTrigger.every(p => p.startsWith('trigger.'))).toBe(true);
	});
});

describe('layout', () => {
	it('lays out the sample with an IF that rejoins at END', () => {
		const l = layoutAutomation(sampleDoc());
		expect(shape(l.seq)).toBe('step1 step2 IF(step3)[step4 | step5]>step6 step6');
		expect(l.orphans).toEqual([]);
		const branch = l.seq.items[2] as BranchItem;
		expect(branch.lanes.map(x => x.label)).toEqual(['Yes', 'Otherwise']);
		expect(branch.lanes.every(x => x.closes)).toBe(true);
		// the gap after the IF block rewires both lanes' last arrows
		const end = l.seq.items[3] as CardItem;
		expect(end.before?.indices.sort()).toEqual([4, 5]);
		expect(l.seq.tail).toBeUndefined();
	});

	it('closes a SPLIT at its JOIN and never draws the JOIN', () => {
		const doc: AutomationDoc = {
			start: 'a',
			nodes: {
				a: { type: 'SPLIT' },
				b: { type: 'ACTION', action: 'x' },
				c: { type: 'ACTION', action: 'y' },
				j: { type: 'JOIN' },
				e: { type: 'END' },
			},
			transitions: [
				{ from: 'a', to: 'b' },
				{ from: 'a', to: 'c' },
				{ from: 'b', to: 'j' },
				{ from: 'c', to: 'j' },
				{ from: 'j', to: 'e' },
			],
		};
		const l = layoutAutomation(doc);
		expect(shape(l.seq)).toBe('SPLIT(a)[b | c]>j e');
		expect((l.seq.items[0] as BranchItem).joinKey).toBe('j');
		expect((l.seq.items[1] as CardItem).before?.indices).toEqual([4]);
	});

	it('draws a loop back as a go back item', () => {
		const doc: AutomationDoc = {
			start: 'a',
			nodes: {
				a: { type: 'ACTION', action: 'x' },
				w: { type: 'WAIT', for: 'P1D' },
				c: { type: 'CHECK' },
				e: { type: 'END' },
			},
			transitions: [
				{ from: 'a', to: 'w' },
				{ from: 'w', to: 'c' },
				{ from: 'c', to: 'e', branch: 'yes' },
				{ from: 'c', to: 'a', branch: 'otherwise' },
			],
		};
		const l = layoutAutomation(doc);
		expect(shape(l.seq)).toBe('a w IF(c)[e! | ->a!]');
	});

	it('nests an IF inside a lane and keeps lanes that end separately open', () => {
		const doc: AutomationDoc = {
			start: 'c1',
			nodes: {
				c1: { type: 'CHECK' },
				c2: { type: 'CHECK' },
				x: { type: 'ACTION', action: 'x' },
				y: { type: 'ACTION', action: 'y' },
				z: { type: 'ACTION', action: 'z' },
				m: { type: 'ACTION', action: 'm' },
				e: { type: 'END' },
			},
			transitions: [
				{ from: 'c1', to: 'c2', branch: 'yes' },
				{ from: 'c1', to: 'z', branch: 'otherwise' },
				{ from: 'c2', to: 'x', branch: 'yes' },
				{ from: 'c2', to: 'y', branch: 'otherwise' },
				{ from: 'x', to: 'm' },
				{ from: 'y', to: 'm' },
				{ from: 'm', to: 'e' },
				{ from: 'z', to: 'e' },
			],
		};
		const l = layoutAutomation(doc);
		expect(shape(l.seq)).toBe('IF(c1)[IF(c2)[x | y]>m m | z]>e e');
	});

	it('lists nodes nothing reaches, and lays out an empty document', () => {
		const doc = sampleDoc();
		doc.nodes!.lonely = { type: 'ACTION', action: 'x' };
		expect(layoutAutomation(doc).orphans).toEqual(['lonely']);
		const empty = layoutAutomation({});
		expect(empty.seq.items).toEqual([]);
		expect(empty.seq.tail).toEqual({ indices: [], start: true });
	});
});

describe('edit operations', () => {
	it('generates step keys that never collide', () => {
		expect(nextKey(sampleDoc())).toBe('step7');
		expect(nextKey({ nodes: { step2: { type: 'END' }, other: { type: 'END' } } })).toBe(
			'step3',
		);
		expect(nextKey({})).toBe('step1');
	});

	it('inserts between two steps by rewiring A -> new -> B', () => {
		const doc = sampleDoc();
		const gap = (layoutAutomation(doc).seq.items[1] as CardItem).before!;
		const { doc: d, key } = insertAt(doc, gap, 'WAIT');
		expect(key).toBe('step7');
		expect(d.nodes!.step7).toEqual({ type: 'WAIT', for: 'P1D' });
		expect(d.transitions).toContainEqual({ from: 'step1', to: 'step7' });
		expect(d.transitions).toContainEqual({ from: 'step7', to: 'step2' });
		expect(d.transitions).not.toContainEqual({ from: 'step1', to: 'step2' });
		expect(shape(layoutAutomation(d).seq)).toBe(
			'step1 step7 step2 IF(step3)[step4 | step5]>step6 step6',
		);
		// the input is untouched
		expect(doc.transitions).toContainEqual({ from: 'step1', to: 'step2' });
	});

	it('inserts at the start and into an empty document', () => {
		const doc = sampleDoc();
		const gap = (layoutAutomation(doc).seq.items[0] as CardItem).before!;
		const { doc: d, key } = insertAt(doc, gap, 'ACTION');
		expect(d.start).toBe(key);
		expect(d.transitions).toContainEqual({ from: key, to: 'step1' });

		const empty = layoutAutomation({});
		const { doc: e, key: k2 } = insertAt({}, empty.seq.tail!, 'ACTION');
		expect(e.start).toBe(k2);
		const { doc: e2, key: k3 } = insertAt(e, layoutAutomation(e).seq.tail!, 'END');
		expect(e2.transitions).toEqual([{ from: k2, to: k3 }]);
		expect(shape(layoutAutomation(e2).seq)).toBe(`${k2} ${k3}`);
	});

	it('gives a new IF empty Yes and Otherwise lanes that rejoin', () => {
		const doc = sampleDoc();
		const gap = (layoutAutomation(doc).seq.items[1] as CardItem).before!;
		const { doc: d, key } = insertAt(doc, gap, 'CHECK');
		const l = layoutAutomation(d);
		expect(shape(l.seq)).toBe(
			`step1 IF(${key})[ | ]>step2 step2 IF(step3)[step4 | step5]>step6 step6`,
		);
		// a step added in the Yes lane lands there
		const yesTail = (l.seq.items[1] as BranchItem).lanes[0].seq.tail!;
		expect(yesTail.laneEnd).toBe(true);
		const { doc: d2, key: k2 } = insertAt(d, yesTail, 'ACTION');
		expect(shape(layoutAutomation(d2).seq)).toBe(
			`step1 IF(${key})[${k2} | ]>step2 step2 IF(step3)[step4 | step5]>step6 step6`,
		);
	});

	it('gives a new SPLIT two empty lanes and a JOIN', () => {
		const doc = sampleDoc();
		const gap = (layoutAutomation(doc).seq.items[1] as CardItem).before!;
		const { doc: d, key } = insertAt(doc, gap, 'SPLIT');
		expect(d.nodes!.step8).toEqual({ type: 'JOIN' });
		const l = layoutAutomation(d);
		expect(shape(l.seq)).toBe(
			`step1 SPLIT(${key})[ | ]>step8 step2 IF(step3)[step4 | step5]>step6 step6`,
		);
		const lane2 = (l.seq.items[1] as BranchItem).lanes[1].seq.tail!;
		const { doc: d2, key: k2 } = insertAt(d, lane2, 'ACTION');
		expect(shape(layoutAutomation(d2).seq)).toBe(
			`step1 SPLIT(${key})[ | ${k2}]>step8 step2 IF(step3)[step4 | step5]>step6 step6`,
		);
	});

	it('only offers End where a path ends or a lane rejoins', () => {
		const l = layoutAutomation(sampleDoc());
		expect(canEndAt((l.seq.items[1] as CardItem).before!)).toBe(false);
		const yesTail = (l.seq.items[2] as BranchItem).lanes[0].seq.tail!;
		expect(canEndAt(yesTail)).toBe(true);
	});

	it('removes a step and reconnects around it', () => {
		const d = removeNode(sampleDoc(), 'step2');
		expect(d.nodes!.step2).toBeUndefined();
		expect(d.transitions).toContainEqual({ from: 'step1', to: 'step3' });
		expect(shape(layoutAutomation(d).seq)).toBe('step1 IF(step3)[step4 | step5]>step6 step6');
		const d2 = removeNode(sampleDoc(), 'step1');
		expect(d2.start).toBe('step2');
	});

	it('removes an IF, keeping its Yes steps', () => {
		const d = removeNode(sampleDoc(), 'step3');
		expect(d.nodes!.step3).toBeUndefined();
		expect(d.nodes!.step5).toBeUndefined();
		expect(shape(layoutAutomation(d).seq)).toBe('step1 step2 step4 step6');
		expect(layoutAutomation(d).orphans).toEqual([]);
	});

	it('removes a SPLIT and its JOIN', () => {
		const doc = sampleDoc();
		const gap = (layoutAutomation(doc).seq.items[1] as CardItem).before!;
		const { doc: d, key } = insertAt(doc, gap, 'SPLIT');
		const d2 = removeNode(d, key);
		expect(d2.nodes!.step8).toBeUndefined();
		expect(shape(layoutAutomation(d2).seq)).toBe(
			'step1 step2 IF(step3)[step4 | step5]>step6 step6',
		);
		expect(d2.transitions).toContainEqual({ from: 'step1', to: 'step2' });
	});

	it('moves a step up and down within its sequence', () => {
		const doc = sampleDoc();
		expect(canMove(doc, 'step2', -1)).toBe(true);
		expect(canMove(doc, 'step1', -1)).toBe(false);
		expect(canMove(doc, 'step2', 1)).toBe(false); // the IF below is not a simple step
		const d = moveNode(doc, 'step2', -1);
		expect(d.start).toBe('step2');
		expect(shape(layoutAutomation(d).seq)).toBe(
			'step2 step1 IF(step3)[step4 | step5]>step6 step6',
		);
		const back = moveNode(d, 'step2', 1);
		expect(shape(layoutAutomation(back).seq)).toBe(
			'step1 step2 IF(step3)[step4 | step5]>step6 step6',
		);
	});

	it('updates a node in place and drops fields set to undefined', () => {
		const d = updateNode(sampleDoc(), 'step2', {
			untilEvent: undefined,
			timeout: undefined,
			for: 'P3D',
		});
		expect(d.nodes!.step2).toEqual({ type: 'WAIT', for: 'P3D' });
	});
});

describe('run state', () => {
	it('reads each card state and the lane taken', () => {
		const v = runView(sampleRun())!;
		expect(cardRun(v, 'step1')?.state).toBe('done');
		expect(cardRun(v, 'step2')?.state).toBe('heard');
		expect(cardRun(v, 'step5')?.state).toBe('skipped');
		expect(v.branches.step3).toBe('yes');
		expect(runWords({ state: 'failed', error: 'No template' })).toBe('Failed: No template');
		expect(runWords({ state: 'skipped' })).toBe('Skipped');
	});

	it('shows waiting until the wake time and not yet for steps ahead', () => {
		const v = runView({
			status: 'WAITING',
			waits: { step2: { kind: 'event', until: '2026-11-21T10:00:00Z' } },
			log: [{ node: 'step1', status: 'DONE', at: '2026-11-19T10:00:00Z' }],
		})!;
		expect(cardRun(v, 'step2')).toMatchObject({
			state: 'waiting',
			until: '2026-11-21T10:00:00Z',
		});
		expect(cardRun(v, 'step4')?.state).toBe('notYet');
		expect(runWords(cardRun(v, 'step2'))).toMatch(/^Waiting until 21 Nov/);
	});

	it('groups check issues by node', () => {
		expect(
			issuesByNode({
				ok: false,
				errors: [{ node: 'step1', message: 'Choose a template' }, { message: 'No END' }],
			}).errors,
		).toEqual({ step1: ['Choose a template'], '': ['No END'] });
	});
});

describe('a built-in param with fixed choices', () => {
	it('shows the chosen notification by its label on the card', () => {
		const catalog: any = {
			appCode: 'leadzumptwo',
			triggers: [{ key: 'E', title: 'E', sentence: 'something happens' }],
			actions: [
				{
					key: 'core:sendNotification',
					title: 'Send a notification',
					sentence: 'send the notification {notification}',
					builtIn: true,
					params: [
						{
							name: 'notification',
							label: 'Notification',
							type: 'NOTIFICATION',
							required: true,
							variables: false,
							choices: [{ label: 'Deal assigned to you', value: 'dealAssigned' }],
						},
					],
				},
			],
		};
		const doc: AutomationDoc = {
			name: 'n',
			trigger: { key: 'E' },
			start: 'a',
			nodes: {
				a: {
					type: 'ACTION',
					action: 'core:sendNotification',
					params: { notification: 'dealAssigned' },
				},
				b: {
					type: 'ACTION',
					action: 'core:sendNotification',
					params: { notification: 'gone' },
				},
			},
			transitions: [{ from: 'a', to: 'b' }],
		} as any;
		expect(cardPlainText(nodeCard(doc, catalog, 'a', []))).toBe(
			'Send the notification Deal assigned to you',
		);
		expect(cardPlainText(nodeCard(doc, catalog, 'b', []))).toBe('Send the notification gone');
	});
});

describe('the step picker groups', () => {
	it('puts built-ins first, then the app, then other functions by namespace', () => {
		const { actionGroups } = require('../FlowEditorPanel');
		const g = actionGroups([
			{ key: 'Lz.b', title: 'B', sentence: '', offered: false },
			{ key: 'core:sendEmail', title: 'Email', sentence: '', builtIn: true },
			{ key: 'Lz.send', title: 'Send', sentence: '', offered: true },
			{ key: 'Aa.x', title: 'X', sentence: '', offered: false },
			{ key: 'Lz.old', title: 'Old', sentence: '' },
		]);
		expect(g.map((x: any) => `${x.label}: ${x.actions.map((a: any) => a.key).join(',')}`)).toEqual([
			'Available in every app: core:sendEmail',
			'This app: Lz.send,Lz.old',
			'Functions: Aa: Aa.x',
			'Functions: Lz: Lz.b',
		]);
	});
});

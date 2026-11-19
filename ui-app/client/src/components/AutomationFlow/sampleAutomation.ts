import { AutomationDoc, AutomationRun, Catalog } from './automationTypes';

/**
 * A deal is created -> send a WhatsApp template -> wait until it is read, at
 * most 2 days -> IF it was read: create a task / otherwise: send a reminder -> END.
 */
export function sampleDoc(): AutomationDoc {
	return {
		name: 'welcomeDeal',
		title: 'Welcome a new deal',
		appCode: 'leadzumptwo',
		trigger: {
			key: 'deal.created',
			filter: {
				operator: 'AND',
				conditions: [{ field: 'trigger.stage', operator: 'EQUALS', value: 'Won' }],
			},
		},
		start: 'step1',
		nodes: {
			step1: {
				type: 'ACTION',
				action: 'lz:sendWhatsApp',
				params: { template: 'welcome', to: '{{trigger.phone}}' },
			},
			step2: {
				type: 'WAIT',
				untilEvent: { key: 'whatsapp.read' },
				timeout: 'P2D',
			},
			step3: {
				type: 'CHECK',
				condition: {
					operator: 'AND',
					conditions: [{ field: 'steps.step1.read', operator: 'IS_TRUE' }],
				},
			},
			step4: {
				type: 'ACTION',
				action: 'lz:createTask',
				params: { title: 'Call {{trigger.leadName}}' },
			},
			step5: {
				type: 'ACTION',
				action: 'lz:sendWhatsApp',
				params: { template: 'reminder', to: '{{trigger.phone}}' },
			},
			step6: { type: 'END' },
		},
		transitions: [
			{ from: 'step1', to: 'step2' },
			{ from: 'step2', to: 'step3' },
			{ from: 'step3', to: 'step4', branch: 'yes' },
			{ from: 'step3', to: 'step5', branch: 'otherwise' },
			{ from: 'step4', to: 'step6' },
			{ from: 'step5', to: 'step6' },
		],
	};
}

export function sampleCatalog(): Catalog {
	return {
		appCode: 'leadzumptwo',
		triggers: [
			{
				key: 'deal.created',
				title: 'Deal created',
				sentence: 'a deal is created',
				fields: [
					{ name: 'leadName', label: 'Lead name', type: 'string' },
					{ name: 'phone', label: 'Phone', type: 'string' },
					{ name: 'stage', label: 'Stage', type: 'string' },
					{ name: 'amount', label: 'Amount', type: 'number' },
					{ name: 'visitAt', label: 'Visit time', type: 'datetime' },
				],
			},
			{
				key: 'whatsapp.read',
				title: 'WhatsApp read',
				sentence: 'the WhatsApp message is read',
				fields: [{ name: 'messageId', label: 'Message id', type: 'string' }],
			},
		],
		actions: [
			{
				key: 'lz:sendWhatsApp',
				title: 'Send WhatsApp template',
				sentence: 'send the WhatsApp template {template} to {to}',
				builtIn: false,
				params: [
					{ name: 'template', label: 'Template', type: 'string', required: true },
					{ name: 'to', label: 'To', type: 'string', variables: true },
				],
				outputs: [
					{ name: 'messageId', label: 'Message id', type: 'string' },
					{ name: 'read', label: 'the message was read', type: 'boolean' },
				],
				idempotent: true,
			},
			{
				key: 'lz:createTask',
				title: 'Create task',
				sentence: 'create a task {title}',
				params: [{ name: 'title', label: 'Title', type: 'string', variables: true }],
				outputs: [{ name: 'taskId', label: 'Task id', type: 'string' }],
			},
		],
	};
}

/** The run of the sample that went down the Yes lane and finished. */
export function sampleRun(): AutomationRun {
	return {
		id: 'run1',
		automation: 'welcomeDeal',
		status: 'DONE',
		subject: 'deal-42',
		log: [
			{ node: 'step1', status: 'STARTED', at: '2026-11-19T10:00:00Z' },
			{ node: 'step1', status: 'DONE', at: '2026-11-19T10:00:01Z' },
			{
				node: 'step2',
				status: 'WAITING',
				at: '2026-11-19T10:00:02Z',
				until: '2026-11-21T10:00:02Z',
			},
			{ node: 'step2', status: 'HAPPENED', at: '2026-11-19T12:00:00Z' },
			{ node: 'step3', status: 'DONE', at: '2026-11-19T12:00:01Z', branch: 'yes' },
			{ node: 'step4', status: 'DONE', at: '2026-11-19T12:00:02Z' },
			{ node: 'step6', status: 'DONE', at: '2026-11-19T12:00:03Z' },
		],
		context: { trigger: { leadName: 'Asha' }, steps: {} },
	};
}

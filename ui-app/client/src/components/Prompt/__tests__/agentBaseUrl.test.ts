import { agentBaseUrl, learningBaseUrl } from '../draftMode';

describe('learningBaseUrl', () => {
	it('points every agent at the shared learning routes', () => {
		expect(learningBaseUrl('/api/ai/appbuilder/chat')).toBe('/api/ai/learning');
		expect(learningBaseUrl('/api/ai/leadzump/chat?draftmode=false')).toBe('/api/ai/learning');
		expect(learningBaseUrl('https://x.com/api/ai/cxzump/chat/')).toBe('https://x.com/api/ai/learning');
	});
});

describe('agentBaseUrl', () => {
	it('drops /chat and any query string', () => {
		expect(agentBaseUrl('/api/ai/appbuilder/chat')).toBe('/api/ai/appbuilder');
		expect(agentBaseUrl('/api/ai/leadzump/chat?draftmode=false')).toBe('/api/ai/leadzump');
		expect(agentBaseUrl('https://x.com/api/ai/a/chat/')).toBe('https://x.com/api/ai/a');
	});
});

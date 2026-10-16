import { agentBaseUrl } from '../draftMode';

describe('agentBaseUrl', () => {
	it('drops /chat and any query string', () => {
		expect(agentBaseUrl('/api/ai/appbuilder/chat')).toBe('/api/ai/appbuilder');
		expect(agentBaseUrl('/api/ai/leadzump/chat?draftmode=false')).toBe('/api/ai/leadzump');
		expect(agentBaseUrl('https://x.com/api/ai/a/chat/')).toBe('https://x.com/api/ai/a');
	});
});

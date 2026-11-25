import { readPendingPrompt } from '../pendingPrompt';

describe('readPendingPrompt (ADZ-2307)', () => {
	it('sends and shows a plain string as it is', () => {
		expect(readPendingPrompt('Try the places again')).toEqual({ text: 'Try the places again' });
	});

	it('sends text and shows display for a handed-over brief', () => {
		const brief = 'Campaign brief from the setup panel (pass these values to campaign_brief). Product: X';
		expect(readPendingPrompt({ text: brief, display: 'Draft the campaign' })).toEqual({
			text: brief,
			display: 'Draft the campaign',
		});
	});

	it('shows the text when display is missing or blank', () => {
		expect(readPendingPrompt({ text: 'Hello' })).toEqual({ text: 'Hello' });
		expect(readPendingPrompt({ text: 'Hello', display: '  ' })).toEqual({ text: 'Hello' });
	});

	it('has nothing to send for empty values', () => {
		expect(readPendingPrompt(undefined)).toBeUndefined();
		expect(readPendingPrompt('')).toBeUndefined();
		expect(readPendingPrompt('   ')).toBeUndefined();
		expect(readPendingPrompt({ display: 'Draft the campaign' })).toBeUndefined();
		expect(readPendingPrompt({ text: 42 })).toBeUndefined();
		expect(readPendingPrompt(7)).toBeUndefined();
	});
});

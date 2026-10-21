import { kindWord, savedNoticeLines } from '../savedNotice';

describe('savedNoticeLines', () => {
	it('says which objects wait for Publish and which were created live', () => {
		expect(
			savedNoticeLines([
				{ kind: 'page', name: 'deals', draft: true },
				{ kind: 'page', name: 'dealProfile', draft: true },
				{
					kind: 'serverfunction',
					name: 'LeadZumpV2.saveDealGender',
					draft: false,
					created: true,
				},
			]),
		).toEqual([
			'Saved to the draft. Nobody sees it until you Publish: page deals, page dealProfile',
			'New, so its first version is live (a new object cannot wait in a draft): server function LeadZumpV2.saveDealGender',
		]);
	});

	it('keeps a live change to an existing object on its own line', () => {
		expect(savedNoticeLines([{ kind: 'theme', name: 'monoLight', draft: false }])).toEqual([
			'Saved live, with no Publish step: theme monoLight',
		]);
	});

	it('is empty when nothing was saved', () => {
		expect(savedNoticeLines([])).toEqual([]);
	});

	it('passes unknown kinds through', () => {
		expect(kindWord('profile')).toBe('profile');
		expect(kindWord('uripath')).toBe('URL path');
	});

	it('names a new object changed again in the same turn once, with the draft', () => {
		expect(
			savedNoticeLines([
				{
					kind: 'serverfunction',
					name: 'LeadZumpV2.saveDealGender',
					draft: false,
					created: true,
				},
				{ kind: 'serverfunction', name: 'LeadZumpV2.saveDealGender', draft: true },
				{ kind: 'page', name: 'deals', draft: true },
			]),
		).toEqual([
			'Saved to the draft. Nobody sees it until you Publish: server function LeadZumpV2.saveDealGender (new: its first version is live, these changes wait), page deals',
		]);
	});

	it('does not promise a draft when a turn changed a new object live again', () => {
		// A page-only turn (SiteZump) writes server functions live, edits included.
		expect(
			savedNoticeLines([
				{ kind: 'serverfunction', name: 'QaDraftTest.ping', draft: false, created: true },
				{ kind: 'serverfunction', name: 'QaDraftTest.ping', draft: false },
			]),
		).toEqual([
			'New, so its first version is live (a new object cannot wait in a draft): server function QaDraftTest.ping',
		]);
	});
});

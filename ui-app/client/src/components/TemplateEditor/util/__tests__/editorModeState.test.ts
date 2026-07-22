import {
	decideMode,
	followLanguage,
	partHasDesign,
	partHasHtml,
	preferredMode,
	EditorMode,
} from '../editorModeState';

const CUSTOM_HTML =
	'<!DOCTYPE html><html lang="en"><head><style>.table{width:50%}</style>' +
	'<link rel="stylesheet" href="https://fonts.googleapis.com/x" /></head>' +
	'<body>Hello ${fullName}, your email is ${email}</body></html>';

const emailTemplate = (overrides: any = {}) => ({
	templateType: 'email',
	defaultLanguage: 'en',
	templateParts: { en: { subject: 'Reset your password', body: CUSTOM_HTML } },
	...overrides,
});

const BODY = 'email|en|body';

// Thread decisions through as the component does: apply the result, feed the next call.
function applied(prevTargetKey: string, currentMode: EditorMode, userPicked: boolean, dec: ReturnType<typeof decideMode>) {
	return {
		targetKey: dec.targetChanged ? undefined : prevTargetKey, // caller adopts targetKey on change
		mode: dec.mode ?? currentMode,
		userPicked: dec.targetChanged ? false : userPicked,
	};
}

describe('partHasHtml / partHasDesign', () => {
	it('detects html and design for a part', () => {
		expect(partHasHtml(emailTemplate(), 'en', 'body')).toBe(true);
		expect(partHasHtml(undefined, 'en', 'body')).toBe(false);
		expect(partHasHtml({ templateParts: { en: { body: '' } } }, 'en', 'body')).toBe(false);
		expect(partHasDesign(emailTemplate({ design: { en: { body: [{ id: 'b' }] } } }), 'en', 'body')).toBe(true);
		expect(partHasDesign(emailTemplate({ design: { en: { body: [] } } }), 'en', 'body')).toBe(false);
	});
});

describe('preferredMode', () => {
	it('raw HTML with no design -> code; design or empty -> visual', () => {
		expect(preferredMode(true, false)).toBe('code');
		expect(preferredMode(true, true)).toBe('visual');
		expect(preferredMode(false, false)).toBe('visual');
	});
});

describe('decideMode — async arrival (the original bug)', () => {
	it('mount empty -> visual, then HTML arrives -> code', () => {
		// mount: target changes from '' to BODY, no content yet
		let d = decideMode({ targetKey: BODY, prevTargetKey: '', currentMode: 'code', userPicked: false, hasHtml: false, hasDesign: false });
		expect(d).toEqual({ targetChanged: true, mode: 'visual' });

		// template arrives: same target, content is raw HTML, still showing visual -> heal to code
		d = decideMode({ targetKey: BODY, prevTargetKey: BODY, currentMode: 'visual', userPicked: false, hasHtml: true, hasDesign: false });
		expect(d).toEqual({ targetChanged: false, mode: 'code' });
	});

	it('present-at-mount raw HTML opens directly in code', () => {
		const d = decideMode({ targetKey: BODY, prevTargetKey: '', currentMode: 'code', userPicked: false, hasHtml: true, hasDesign: false });
		expect(d).toEqual({ targetChanged: true, mode: undefined }); // already code
	});

	it('a saved block design opens in visual', () => {
		const d = decideMode({ targetKey: BODY, prevTargetKey: '', currentMode: 'code', userPicked: false, hasHtml: true, hasDesign: true });
		expect(d).toEqual({ targetChanged: true, mode: 'visual' });
	});
});

describe('decideMode — SELF-HEALS the stuck state seen in the console', () => {
	// Console showed: {currentMode:'visual', hasHtml:true, hasDesign:false, prev.key===targetKey, no user pick}.
	// The old edge-triggered logic returned "(none)" here and stayed stuck. It must now heal to code.
	it('recovers a visual-with-raw-HTML target that has no user override', () => {
		const d = decideMode({ targetKey: BODY, prevTargetKey: BODY, currentMode: 'visual', userPicked: false, hasHtml: true, hasDesign: false });
		expect(d.mode).toBe('code');
	});

	it('keeps healing idempotently until it lands on code', () => {
		let mode: EditorMode = 'visual';
		for (let i = 0; i < 3; i++) {
			const d = decideMode({ targetKey: BODY, prevTargetKey: BODY, currentMode: mode, userPicked: false, hasHtml: true, hasDesign: false });
			mode = d.mode ?? mode;
		}
		expect(mode).toBe('code');
	});
});

describe('decideMode — respects the user and does not thrash', () => {
	it('does not override an explicit Visual choice on a raw-HTML part', () => {
		const d = decideMode({ targetKey: BODY, prevTargetKey: BODY, currentMode: 'visual', userPicked: true, hasHtml: true, hasDesign: false });
		expect(d.mode).toBeUndefined();
	});

	it('does not yank Code -> Visual when the field is cleared mid-edit', () => {
		const d = decideMode({ targetKey: BODY, prevTargetKey: BODY, currentMode: 'code', userPicked: false, hasHtml: false, hasDesign: false });
		expect(d.mode).toBeUndefined();
	});

	it('is a no-op once already in code for a raw-HTML part (no loop)', () => {
		const d = decideMode({ targetKey: BODY, prevTargetKey: BODY, currentMode: 'code', userPicked: false, hasHtml: true, hasDesign: false });
		expect(d).toEqual({ targetChanged: false });
	});
});

describe('decideMode — target changes re-decide and reset override', () => {
	it('switching part re-decides from that part content and signals reset', () => {
		const d = decideMode({ targetKey: 'inapp|en|title', prevTargetKey: BODY, currentMode: 'code', userPicked: true, hasHtml: false, hasDesign: false });
		expect(d.targetChanged).toBe(true);
		expect(d.mode).toBe('visual'); // title part empty -> visual
	});

	it('switching language to an empty locale re-decides to visual', () => {
		const d = decideMode({ targetKey: 'email|fr|body', prevTargetKey: BODY, currentMode: 'code', userPicked: false, hasHtml: false, hasDesign: false });
		expect(d).toEqual({ targetChanged: true, mode: 'visual' });
	});
});

describe('followLanguage', () => {
	it('follows the template default until the user picks', () => {
		expect(followLanguage(emailTemplate({ defaultLanguage: 'fr' }), 'en', false)).toBe('fr');
		expect(followLanguage({ templateParts: { de: { body: 'x' } } }, 'en', false)).toBe('de');
		expect(followLanguage(emailTemplate({ defaultLanguage: 'fr' }), 'en', true)).toBe('en');
		expect(followLanguage(undefined, 'en', false)).toBe('en');
		expect(followLanguage(emailTemplate(), 'en', false)).toBe('en');
	});
});

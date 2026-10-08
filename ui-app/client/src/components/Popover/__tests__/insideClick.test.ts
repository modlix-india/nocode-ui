import { closeAfterClick, isPanelActionClick } from '../insideClick';

// The DOM a popover's portalled panel renders: the panel is `comp compPopover popover`, the
// components inside keep their own root classes.
function panelWith(html: string): HTMLElement {
	const panel = document.createElement('div');
	panel.className = 'comp compPopover popover';
	panel.innerHTML = `<div class="popoverContainer">${html}</div>`;
	document.body.appendChild(panel);
	return panel;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('isPanelActionClick', () => {
	test('a Button closes the panel, also through its label or icon', () => {
		const panel = panelWith(
			'<button class="comp compButton button _outlined"><i class="_leftButtonIcon"></i><span id="t">Delete</span></button>',
		);
		expect(isPanelActionClick(panel.querySelector('button'), panel)).toBe(true);
		expect(isPanelActionClick(panel.querySelector('#t'), panel)).toBe(true);
		expect(isPanelActionClick(panel.querySelector('i'), panel)).toBe(true);
	});

	test('a Menu item and a Link close the panel', () => {
		const panel = panelWith(
			'<a class="comp compMenu _level0">My profile</a><a class="comp compLink">Help</a>',
		);
		expect(isPanelActionClick(panel.querySelector('.compMenu'), panel)).toBe(true);
		expect(isPanelActionClick(panel.querySelector('.compLink'), panel)).toBe(true);
	});

	test('fields, toggles, dropdowns and the panel itself keep it open', () => {
		const panel = panelWith(
			'<div class="comp compTextBox"><input id="i"/></div>' +
				'<div class="comp compToggleButton" id="tg"><span class="_knob"></span></div>' +
				'<div class="comp compDropdown"><button type="button" class="_dropdownBackdrop" id="bd"></button></div>' +
				'<div class="comp compCalendar"><div class="_calendarDropdownSelect" id="cal"></div></div>' +
				'<div class="comp compGrid" id="g"></div>',
		);
		for (const id of ['i', 'tg', 'bd', 'cal', 'g'])
			expect(isPanelActionClick(panel.querySelector('#' + id), panel)).toBe(false);
		expect(isPanelActionClick(panel, panel)).toBe(false);
	});

	test('the trigger of a popover nested in the panel keeps the panel open', () => {
		const panel = panelWith(
			'<div class="comp compPopover"><div><button class="comp compButton button" id="b">More</button></div></div>',
		);
		expect(isPanelActionClick(panel.querySelector('#b'), panel)).toBe(false);
	});

	test('a disabled menu item and a menu item with a sub menu keep it open', () => {
		const panel = panelWith(
			'<a class="comp compMenu _disabled" id="d">Off</a>' +
				'<a class="comp compMenu" id="s">More<i class="_caretIcon"></i></a>',
		);
		expect(isPanelActionClick(panel.querySelector('#d'), panel)).toBe(false);
		expect(isPanelActionClick(panel.querySelector('#s'), panel)).toBe(false);
	});

	test('a click outside the panel is not this panel’s business', () => {
		const panel = panelWith('');
		const elsewhere = document.createElement('button');
		elsewhere.className = 'comp compButton';
		document.body.appendChild(elsewhere);
		expect(isPanelActionClick(elsewhere, panel)).toBe(false);
		expect(isPanelActionClick(null, panel)).toBe(false);
		expect(isPanelActionClick(elsewhere, null)).toBe(false);
	});
});

describe('closeAfterClick', () => {
	// Closing inside the click unmounted the clicked Button before its onClick ran (seen on
	// dev: the leads Delete and products Edit menus closed and did nothing), so the close
	// must wait until the click has been handled.
	test('does not close during the click, closes right after it', () => {
		jest.useFakeTimers();
		try {
			const close = jest.fn();
			closeAfterClick(close);
			expect(close).not.toHaveBeenCalled();
			jest.runAllTimers();
			expect(close).toHaveBeenCalledTimes(1);
		} finally {
			jest.useRealTimers();
		}
	});
});

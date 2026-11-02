import {
	designViewportHeight,
	pinViewportHeightUnits,
	resetDesignViewportHeight,
	typicalViewportHeight,
} from '../designViewport';
import { processComponentStylePseudoClasses } from '../styleProcessor';

const g = globalThis as any;

function at(search: string, framed: boolean) {
	window.history.replaceState({}, '', '/x/FIN/page/home' + search);
	Object.defineProperty(window, 'parent', {
		configurable: true,
		value: framed ? ({} as Window) : window,
	});
	resetDesignViewportHeight();
}

const heightOf = () =>
	processComponentStylePseudoClasses({} as any, {}, { '': { comp: { height: '100vh' } } }).comp
		.height;

beforeEach(() => {
	g.cdnPrefix = undefined;
});

afterAll(() => at('', false));

describe('viewport units in a page framed by the click map', () => {
	it('resolve against the screen height the viewer names', () => {
		at('?modlixDesign=1&mlxVh=900', true);
		expect(designViewportHeight()).toBe(900);
		expect(heightOf()).toBe('900px');
	});

	it('stay real on an ordinary visit', () => {
		at('?mlxVh=900', true);
		expect(heightOf()).toBe('100vh');
	});

	it('stay real when the design link is opened in a tab rather than a frame', () => {
		at('?modlixDesign=1&mlxVh=900', false);
		expect(heightOf()).toBe('100vh');
	});

	it('ignore a height nobody has', () => {
		at('?modlixDesign=1&mlxVh=99999', true);
		expect(heightOf()).toBe('100vh');
	});
});

describe('pinViewportHeightUnits', () => {
	it('rewrites vh and its dynamic variants, leaves everything else', () => {
		expect(pinViewportHeightUnits('calc(100vh - 80px)', 900)).toBe('calc(900px - 80px)');
		expect(pinViewportHeightUnits('50dvh', 900)).toBe('450px');
		expect(pinViewportHeightUnits('33.3svh', 900)).toBe('299.7px');
		expect(pinViewportHeightUnits('40vw', 900)).toBe('40vw');
		expect(pinViewportHeightUnits('12px', 900)).toBe('12px');
	});
});

describe('typicalViewportHeight', () => {
	it('gives each click-map band an ordinary screen', () => {
		expect(typicalViewportHeight(390)).toBe(844);
		expect(typicalViewportHeight(820)).toBe(1180);
		expect(typicalViewportHeight(1440)).toBe(900);
	});
});

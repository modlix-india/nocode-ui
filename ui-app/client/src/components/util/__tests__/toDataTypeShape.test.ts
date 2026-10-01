/**
 * toDataTypeShape brings a dropdown's `selectedData` -- often a single item, since that is
 * what a fetch by id returns -- into the full shape its `datatype` describes. These run
 * the result through the real getRenderData, because what matters is the options it
 * yields, not the intermediate shape.
 */
import { getRenderData, toDataTypeShape } from '../getRenderData';

type DataType = Parameters<typeof toDataTypeShape>[1];

/** label -> value for what getRenderData makes of `source` once shaped. */
function options(
	source: any,
	dataType: DataType,
	selectionType: 'KEY' | 'INDEX' | 'OBJECT' = 'KEY',
	keys: { label?: string; selection?: string; unique?: string } = {},
) {
	const shaped = toDataTypeShape(source, dataType);
	if (shaped === undefined) return {};
	return Object.fromEntries(
		getRenderData(
			shaped,
			dataType,
			'INDEX',
			'',
			selectionType,
			keys.selection,
			'KEY',
			keys.label,
		)
			.filter(e => e !== undefined)
			.map(e => [e!.label, e!.value]),
	);
}

const PUNE = { id: 'p1', name: 'Pune' };
const DELHI = { id: 'd1', name: 'Delhi' };
const BY_ID = { label: 'name', selection: 'id' };

describe('nothing given', () => {
	it.each([undefined, null])('yields nothing for %p', v => {
		expect(toDataTypeShape(v, 'LIST_OF_OBJECTS')).toBeUndefined();
		expect(toDataTypeShape(v, 'OBJECT_OF_OBJECTS')).toBeUndefined();
	});
});

describe('LIST_OF_STRINGS', () => {
	it('takes one string', () => {
		expect(options('Pune', 'LIST_OF_STRINGS')).toEqual({ Pune: 'Pune' });
	});

	it('takes the full shape', () => {
		expect(options(['Pune', 'Delhi'], 'LIST_OF_STRINGS')).toEqual({
			Pune: 'Pune',
			Delhi: 'Delhi',
		});
	});
});

describe('LIST_OF_OBJECTS', () => {
	it('takes one object, the shape a fetch by id returns', () => {
		expect(options(PUNE, 'LIST_OF_OBJECTS', 'KEY', BY_ID)).toEqual({ Pune: 'p1' });
	});

	it('takes the full shape', () => {
		expect(options([PUNE, DELHI], 'LIST_OF_OBJECTS', 'KEY', BY_ID)).toEqual({
			Pune: 'p1',
			Delhi: 'd1',
		});
	});

	it('keeps the whole object for OBJECT selection', () => {
		expect(options(PUNE, 'LIST_OF_OBJECTS', 'OBJECT', BY_ID)).toEqual({ Pune: PUNE });
	});
});

describe('LIST_OF_LISTS', () => {
	it('takes one list', () => {
		expect(
			options(['p1', 'Pune'], 'LIST_OF_LISTS', 'KEY', { label: '1', selection: '0' }),
		).toEqual({ Pune: 'p1' });
	});

	it('takes the full shape', () => {
		expect(
			options(
				[
					['p1', 'Pune'],
					['d1', 'Delhi'],
				],
				'LIST_OF_LISTS',
				'KEY',
				{ label: '1', selection: '0' },
			),
		).toEqual({ Pune: 'p1', Delhi: 'd1' });
	});
});

describe('OBJECT_OF_PRIMITIVES', () => {
	// Label and value both come off the map: label is the value, INDEX selection the key.
	function primitives(source: any) {
		const shaped = toDataTypeShape(source, 'OBJECT_OF_PRIMITIVES');
		return Object.fromEntries(
			getRenderData(shaped, 'OBJECT_OF_PRIMITIVES', 'INDEX', '', 'INDEX', '', 'OBJECT', '')
				.filter(e => e !== undefined)
				.map(e => [e!.label, e!.value]),
		);
	}

	it('takes the full shape, keys intact', () => {
		expect(primitives({ p1: 'Pune', d1: 'Delhi' })).toEqual({ Pune: 'p1', Delhi: 'd1' });
	});

	it('merges an array of partial maps', () => {
		expect(primitives([{ p1: 'Pune' }, { d1: 'Delhi' }])).toEqual({ Pune: 'p1', Delhi: 'd1' });
	});
});

describe('OBJECT_OF_OBJECTS', () => {
	it('takes the full shape, so INDEX selection still yields the map key', () => {
		expect(options({ p1: PUNE, d1: DELHI }, 'OBJECT_OF_OBJECTS', 'INDEX', BY_ID)).toEqual({
			Pune: 'p1',
			Delhi: 'd1',
		});
	});

	it('takes a one-entry map', () => {
		expect(options({ p1: PUNE }, 'OBJECT_OF_OBJECTS', 'INDEX', BY_ID)).toEqual({ Pune: 'p1' });
	});

	it('takes a bare row for KEY selection', () => {
		expect(options(PUNE, 'OBJECT_OF_OBJECTS', 'KEY', BY_ID)).toEqual({ Pune: 'p1' });
	});

	it('takes an array of bare rows', () => {
		expect(options([PUNE, DELHI], 'OBJECT_OF_OBJECTS', 'KEY', BY_ID)).toEqual({
			Pune: 'p1',
			Delhi: 'd1',
		});
	});

	it('merges an array of partial maps', () => {
		expect(options([{ p1: PUNE }, { d1: DELHI }], 'OBJECT_OF_OBJECTS', 'INDEX', BY_ID)).toEqual(
			{ Pune: 'p1', Delhi: 'd1' },
		);
	});
});

describe('OBJECT_OF_LISTS', () => {
	const LIST_KEYS = { label: '1', selection: '0' };

	it('takes the full shape', () => {
		expect(
			options({ a: ['p1', 'Pune'], b: ['d1', 'Delhi'] }, 'OBJECT_OF_LISTS', 'KEY', LIST_KEYS),
		).toEqual({ Pune: 'p1', Delhi: 'd1' });
	});

	it('takes one bare list', () => {
		expect(options(['p1', 'Pune'], 'OBJECT_OF_LISTS', 'KEY', LIST_KEYS)).toEqual({
			Pune: 'p1',
		});
	});

	it('takes an array of bare lists', () => {
		expect(
			options(
				[
					['p1', 'Pune'],
					['d1', 'Delhi'],
				],
				'OBJECT_OF_LISTS',
				'KEY',
				LIST_KEYS,
			),
		).toEqual({ Pune: 'p1', Delhi: 'd1' });
	});

	/** An array is itself an item in this type, so a list of maps must not read as one. */
	it('merges an array of partial maps', () => {
		expect(
			options(
				[{ a: ['p1', 'Pune'] }, { b: ['d1', 'Delhi'] }],
				'OBJECT_OF_LISTS',
				'KEY',
				LIST_KEYS,
			),
		).toEqual({ Pune: 'p1', Delhi: 'd1' });
	});
});

const data: any = {
	number1: 72,
	textBoxText: 'Sample Value',
	textAreaText: 'Sample Text Area Value',
	dropdownOptions: [
		'Option 1',
		'Option 2',
		'Option 3',
		'Option 4',
		'Option 5',
		'Option 6',
		'Option 7',
	],
	dropdDownValue: 'Option 1',
	radioOptions: ['Option 1', 'Option 2', 'Option 3'],
	radioSingleValue: 'Option 1',
	radioMultiValue: ['Option 1', 'Option 3'],
	booleanTrue: true,
	booleanFalse: false,
	sampleInteger: 1,
	table1: [],
};

const SECTION_ARRAY = ['A', 'B', 'X', 'Y'];
const COUNT = 10 + (Math.round(Math.random() * 100) % 7);
for (let i = 0; i < COUNT; i++) {
	data.table1.push({
		id: i,
		name: `Name ${i + 1}`,
		section: SECTION_ARRAY[Math.round(Math.random() * 100) % 4],
		maths: Math.round(Math.random() * 100),
		physics: Math.round(Math.random() * 100),
		chemistry: Math.round(Math.random() * 100),
	});
}

export const sample = data;

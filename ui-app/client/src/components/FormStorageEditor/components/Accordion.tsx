import React, { DragEvent } from 'react';
import { FormCompDefinition } from './formCommons';
import AccordionPanel from './AccordionPanel';
import SmartElementEditor from '../editors/SmartElementEditor';
import TextTypeEditor from '../editors/TextTypeEditor';
import OptionTypeEditor from '../editors/OptionTypeEditor';

const COMP_EDITORS_DEF: { [key: string]: [React.ElementType, string] } = {
	NameEditor: [SmartElementEditor, 'name'],
	EmailEditor: [SmartElementEditor, 'email'],
	PhoneEditor: [SmartElementEditor, 'phone'],
	TextBoxEditor: [TextTypeEditor, 'textBox'],
	TextAreaEditor: [TextTypeEditor, 'textArea'],
	DropdownEditor: [OptionTypeEditor, 'dropdown'],
	RadioButtonEditor: [OptionTypeEditor, 'radioButton'],
	CheckBoxEditor: [OptionTypeEditor, 'checkBox'],
};

const getCompEditor = (
	data: FormCompDefinition,
	handleFieldDefMapChanges: (key: string, data: FormCompDefinition, newKey?: string) => void,
) => {
	let Editor = COMP_EDITORS_DEF[data.editorType][0];
	return (
		<Editor
			key={data.uuid}
			data={data}
			handleFieldDefMapChanges={handleFieldDefMapChanges}
			editorType={COMP_EDITORS_DEF[data.editorType][1]}
		/>
	);
};

interface AccordionProps {
	data: Array<FormCompDefinition>;
	handleDrop: (e: DragEvent<HTMLDivElement>, key: string) => void;
	handleDelete: (key: string) => void;
	handleDragStart: (e: DragEvent<HTMLDivElement>, key: string, dropType: string) => void;
	handleFieldDefMapChanges: (key: string, data: FormCompDefinition, newKey?: string) => void;
}

export default function Accordion({
	data,
	handleDrop,
	handleDelete,
	handleDragStart,
	handleFieldDefMapChanges,
}: AccordionProps) {
	return (
		<div className="_accordion">
			{data.map((each: FormCompDefinition) => {
				return (
					<AccordionPanel
						data={each}
						key={each.uuid}
						handleDrop={handleDrop}
						handleDelete={handleDelete}
						handleDragStart={handleDragStart}
					>
						{getCompEditor(each, handleFieldDefMapChanges)}
					</AccordionPanel>
				);
			})}
		</div>
	);
}

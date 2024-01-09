import React, { DragEvent } from 'react';
import { FormCompDefinition } from './formCommons';
import AccordionPanel from './AccordionPanel';
import SmartElementEditor from '../editors/SmartElementEditor';
import TextTypeEditor from '../editors/TextTypeEditor';
import OptionTypeEditor from '../editors/OptionTypeEditor';

const getCompEditor = (
	data: FormCompDefinition,
	handleCompDefChanges: (key: string, data: FormCompDefinition, newKey?: string) => void,
) => {
	const COMP_EDITORS: { [key: string]: any } = {
		NameEditor: (
			<SmartElementEditor
				data={data}
				key={data.key}
				handleCompDefChanges={handleCompDefChanges}
				editorType="name"
			/>
		),
		EmailEditor: (
			<SmartElementEditor
				data={data}
				key={data.key}
				handleCompDefChanges={handleCompDefChanges}
				editorType="email"
			/>
		),
		PhoneEditor: (
			<SmartElementEditor
				data={data}
				key={data.key}
				handleCompDefChanges={handleCompDefChanges}
				editorType="phone"
			/>
		),
		TextBoxEditor: (
			<TextTypeEditor
				data={data}
				key={data.key}
				handleCompDefChanges={handleCompDefChanges}
				editerType="textBox"
			/>
		),
		TextAreaEditor: (
			<TextTypeEditor
				data={data}
				key={data.key}
				handleCompDefChanges={handleCompDefChanges}
				editerType="textArea"
			/>
		),
		DropdownEditor: (
			<OptionTypeEditor
				data={data}
				key={data.key}
				handleCompDefChanges={handleCompDefChanges}
				editerType="dropdown"
			/>
		),
		RadioButtonEditor: (
			<OptionTypeEditor
				data={data}
				key={data.key}
				handleCompDefChanges={handleCompDefChanges}
				editerType="radioButton"
			/>
		),
		CheckBoxEditor: (
			<OptionTypeEditor
				data={data}
				key={data.key}
				handleCompDefChanges={handleCompDefChanges}
				editerType="checkBox"
			/>
		),
	};
	return COMP_EDITORS[data.editorType];
};

interface AccordionProps {
	data: Array<FormCompDefinition>;
	handleDrop: (e: DragEvent<HTMLDivElement>, key: string) => void;
	handleDelete: (key: string) => void;
	handleDragStart: (e: DragEvent<HTMLDivElement>, key: string, dropType: string) => void;
	handleCompDefChanges: (key: string, data: FormCompDefinition, newKey?: string) => void;
}

export default function Accordion({
	data,
	handleDrop,
	handleDelete,
	handleDragStart,
	handleCompDefChanges,
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
						{getCompEditor(each, handleCompDefChanges)}
					</AccordionPanel>
				);
			})}
		</div>
	);
}

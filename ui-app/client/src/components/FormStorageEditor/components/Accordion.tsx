import React, { DragEvent } from 'react';
import { FormCompDefinition } from './formDefinitions';
import AccordionPanel from './AccordionPanel';
import SmartElementEditor from '../editors/SmartElementEditor';
import TextTypeEditor from '../editors/TextTypeEditor';
import OptionTypeEditor from '../editors/OptionTypeEditor';

interface AccordionProps {
	data: Array<FormCompDefinition>;
	handleDrop: (e: DragEvent<HTMLDivElement>, key: string) => void;
	handleDelete: (key: string) => void;
	handleDragStart: (e: DragEvent<HTMLDivElement>, key: string, dropType: string) => void;
	handleCompDefChanges: (key: string, data: FormCompDefinition) => void;
}

export default function Accordion({
	data,
	handleDrop,
	handleDelete,
	handleDragStart,
	handleCompDefChanges,
}: AccordionProps) {
	const getCompEditor = (data: FormCompDefinition) => {
		let editor = <></>;
		switch (data.editorType) {
			case 'NameEditor':
				editor = (
					<SmartElementEditor
						data={data}
						key={data.key}
						handleCompDefChanges={handleCompDefChanges}
						editorType="name"
					/>
				);
				break;
			case 'EmailEditor':
				editor = (
					<SmartElementEditor
						data={data}
						key={data.key}
						handleCompDefChanges={handleCompDefChanges}
						editorType="email"
					/>
				);
				break;
			case 'PhoneEditor':
				editor = (
					<SmartElementEditor
						data={data}
						key={data.key}
						handleCompDefChanges={handleCompDefChanges}
						editorType="phone"
					/>
				);
				break;
			case 'TextBoxEditor':
				editor = (
					<TextTypeEditor
						data={data}
						key={data.key}
						handleCompDefChanges={handleCompDefChanges}
						editerType="textBox"
					/>
				);
				break;
			case 'TextAreaEditor':
				editor = (
					<TextTypeEditor
						data={data}
						key={data.key}
						handleCompDefChanges={handleCompDefChanges}
						editerType="textArea"
					/>
				);
				break;
			case 'DropdownEditor':
				editor = (
					<OptionTypeEditor
						data={data}
						key={data.key}
						handleCompDefChanges={handleCompDefChanges}
						editerType="dropdown"
					/>
				);
				break;
			case 'RadioButtonEditor':
				editor = (
					<OptionTypeEditor
						data={data}
						key={data.key}
						handleCompDefChanges={handleCompDefChanges}
						editerType="radioButton"
					/>
				);
				break;
			case 'CheckBoxEditor':
				editor = (
					<OptionTypeEditor
						data={data}
						key={data.key}
						handleCompDefChanges={handleCompDefChanges}
						editerType="checkBox"
					/>
				);
				break;
		}
		return editor;
	};
	return (
		<div className="_accordion">
			{data.map((each: FormCompDefinition) => {
				return (
					<AccordionPanel
						data={each}
						key={each.key}
						handleDrop={handleDrop}
						handleDelete={handleDelete}
						handleDragStart={handleDragStart}
					>
						{getCompEditor(each)}
					</AccordionPanel>
				);
			})}
		</div>
	);
}

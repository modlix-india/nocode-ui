import React, { useState } from 'react';
import { getData, PageStoreExtractor } from '../../context/StoreContext';
import { ComponentProperty, RenderContext, DataLocation } from '../../types/common';
import { Component } from '../../types/common';
import properties from './popupProperties';
import PopupStyles from './PopupStyles';

interface PopupProps extends React.ComponentPropsWithoutRef<'a'> {
	definition: {
		properties: {
			buttonLable: ComponentProperty<string>;
			modalHeading: ComponentProperty<string>;
			modalContent: ComponentProperty<string>;
		};
	};
	pageDefinition: {
		translations: {
			[key: string]: {
				[key: string]: string;
			};
		};
	};

	locationHistory: Array<DataLocation | string>;
	context: RenderContext;
}

function Popup(props: PopupProps) {
	const {
		definition: {
			properties: { buttonLable, modalHeading, modalContent },
		},
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const buttonLableValue = getData(buttonLable, locationHistory, pageExtractor);
	const modalHeadingvalue = getData(modalHeading, locationHistory, pageExtractor);
	const modalContentvalue = getData(modalContent, locationHistory, pageExtractor);
	const [modal, setModal] = useState(false);
	const toggleModal = () => {
		setModal(!modal);
	};

	return (
		<div>
			<button onClick={toggleModal} className="buttonModal">
				{buttonLableValue}
			</button>
			{modal && (
				<div className="modal">
					<div className="overlay"></div>
					<div className="modalContent">
						<h2>{modalHeadingvalue}</h2>
						<p>{modalContentvalue}</p>
						<button className="closeModal" onClick={toggleModal}>
							CLOSE
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

const component: Component = {
	name: 'Popup',
	displayName: 'Popup',
	description: 'Popup component',
	component: Popup,
	propertyValidation: (props: PopupProps): Array<string> => [],
	properties,
	styleComponent: PopupStyles,
};

export default component;

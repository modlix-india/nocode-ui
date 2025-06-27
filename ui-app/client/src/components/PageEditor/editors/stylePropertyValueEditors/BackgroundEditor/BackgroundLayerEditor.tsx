import React, { useEffect, useState } from 'react';
import { StyleEditorsProps, valuesChangedOnlyValues } from '../simpleEditors';
import { ExpressionEditor2 } from '../../propertyValueEditors/ExpressionEditor2';
import { duplicate } from '@fincity/kirun-js';
import {
	BackgroundLayer,
	joinBackgroundLayers,
	parseBackgroundLayerType,
	splitBackgroundLayers,
} from './common';
import { IconsSimpleEditor } from '../simpleEditors/IconsSimpleEditor';
import { ButtonBar } from '../simpleEditors/ButtonBar';
import { BackgroundImageEditor } from './BackgroundImageEditor';
import { BackgroundLayerPropertiesEditor } from './BackgroundLayerPropertiesEditor';
import { BackgroundGradientEditor } from './BackgroundGradientEditor';
import './BackgroundEditor.css'; // Import the CSS file

export function BackgroundLayerEditor(props: Readonly<StyleEditorsProps>) {
	const [layers, setLayers] = useState<string[]>(['']);
	const [expandedLayers, setExpandedLayers] = useState<number[]>([0]);
	const [rawValue, setRawValue] = useState('');

	// Fetch the current background-image value
	useEffect(() => {
		console.log('useEffect triggered');
		const iterateProps = props.iterateProps || {};
		const bgImageProp = iterateProps['backgroundImage'];
		const value = bgImageProp?.value ?? '';
		console.log('Current background-image value:', value);
		setRawValue(value);
		const splitLayers = splitBackgroundLayers(value);
		console.log('Split layers:', splitLayers);
		setLayers(splitLayers);
	}, [
		props.iterateProps,
		props.selectedComponent,
		props.subComponentName,
		props.pseudoState,
		props.selectorPref,
	]);

	// Update background-image value in parent
	const updateLayers = (newLayers: string[]) => {
		try {
			console.log('updateLayers called with', newLayers);
			setLayers(newLayers);
			const newValue = joinBackgroundLayers(newLayers);
			console.log('New background-image value:', newValue);
			setRawValue(newValue);
			valuesChangedOnlyValues({
				subComponentName: props.subComponentName,
				selectedComponent: props.selectedComponent,
				selectedComponentsList: props.selectedComponentsList,
				propValues: [{ prop: 'backgroundImage', value: newValue }],
				selectorPref: props.selectorPref,
				defPath: props.defPath,
				locationHistory: props.locationHistory,
				pageExtractor: props.pageExtractor,
			});
			console.log('updateLayers completed');
		} catch (error) {
			console.error('Error in updateLayers:', error);
		}
	};

	const handleLayerChange = (index: number, value: string) => {
		const newLayers = duplicate(layers);
		newLayers[index] = value;
		updateLayers(newLayers);
	};

	const addLayer = () => {
		try {
			console.log('Add layer clicked');
			updateLayers([...layers, '']);
			setExpandedLayers([...expandedLayers, layers.length]);
			console.log('Add layer completed successfully');
		} catch (error) {
			console.error('Error in addLayer:', error);
		}
	};

	const removeLayer = (index: number) => {
		try {
			console.log('Remove layer clicked', index);
			if (layers.length === 1) {
				console.log('Cannot remove the last layer');
				return;
			}
			const newLayers = duplicate(layers);
			newLayers.splice(index, 1);
			updateLayers(newLayers);
			setExpandedLayers(
				expandedLayers.filter(i => i !== index).map(i => (i > index ? i - 1 : i)),
			);
			console.log('Remove layer completed successfully');
		} catch (error) {
			console.error('Error in removeLayer:', error);
		}
	};

	const moveLayer = (from: number, to: number) => {
		if (to < 0 || to >= layers.length) return;
		const newLayers = duplicate(layers);
		const [moved] = newLayers.splice(from, 1);
		newLayers.splice(to, 0, moved);
		updateLayers(newLayers);

		// Update expanded layers indices
		const newExpandedLayers = expandedLayers.map(i => {
			if (i === from) return to;
			if (i === to) return from;
			return i;
		});
		setExpandedLayers(newExpandedLayers);
	};

	const toggleLayerExpansion = (index: number) => {
		if (expandedLayers.includes(index)) {
			setExpandedLayers(expandedLayers.filter(i => i !== index));
		} else {
			setExpandedLayers([...expandedLayers, index]);
		}
	};

	const handleAddLayerClick = (e: React.MouseEvent) => {
		console.log('Add layer button clicked directly');
		e.stopPropagation();
		e.preventDefault();
		addLayer();
		return false; // Prevent default and stop propagation
	};

	const handleRemoveLayerClick = (e: React.MouseEvent, idx: number) => {
		console.log('Remove layer button clicked', idx);
		e.stopPropagation();
		e.preventDefault();
		removeLayer(idx);
		return false; // Prevent default and stop propagation
	};

	return (
		<div
			className="_backgroundEditor"
			onClick={e => e.stopPropagation()}
			onMouseDown={e => e.stopPropagation()}
		>
			{layers.map((layer, idx) => {
				const isExpanded = expandedLayers.includes(idx);
				const layerType = parseBackgroundLayerType(layer);

				return (
					<div key={idx} className="_backgroundLayerCard">
						<div
							className="_backgroundLayerHeader"
							onClick={e => {
								console.log('Layer header clicked', idx);
								e.stopPropagation();
								toggleLayerExpansion(idx);
							}}
						>
							<span className="_layerTitle">Layer {idx + 1}</span>
							<div className="_layerType">{layerType}</div>
							<div className="_layerActions">
								<button
									className="_iconButton"
									onClick={e => {
										e.stopPropagation();
										moveLayer(idx, idx - 1);
									}}
									disabled={idx === 0}
								>
									↑
								</button>
								<button
									className="_iconButton"
									onClick={e => {
										e.stopPropagation();
										moveLayer(idx, idx + 1);
									}}
									disabled={idx === layers.length - 1}
								>
									↓
								</button>
								<button
									className="_iconButton"
									onClick={e => handleRemoveLayerClick(e, idx)}
									onMouseDown={e => {
										console.log('Remove layer button mouse down', idx);
										e.stopPropagation();
										e.preventDefault();
									}}
									disabled={layers.length === 1}
								>
									✕
								</button>
								<span className="_expandIcon">{isExpanded ? '▼' : '▶'}</span>
							</div>
						</div>

						{isExpanded && (
							<div className="_backgroundLayerBody">
								<div className="_layerTypeSelector">
									<ButtonBar
										options={[
											{ name: 'url', displayName: 'Image' },
											{ name: 'linear-gradient', displayName: 'Gradient' },
										]}
										value={layerType === 'url' ? 'url' : 'linear-gradient'}
										onChange={value => {
											if (value === 'url') {
												handleLayerChange(idx, 'url("")');
											} else {
												handleLayerChange(
													idx,
													'linear-gradient(to bottom, transparent, transparent)',
												);
											}
										}}
									/>
								</div>

								{layerType === 'url' ? (
									<BackgroundImageEditor
										value={layer}
										onChange={value => handleLayerChange(idx, value)}
									/>
								) : (
									<BackgroundGradientEditor
										value={layer}
										onChange={value => handleLayerChange(idx, value)}
									/>
								)}
								<BackgroundLayerPropertiesEditor
									layerIndex={idx}
									totalLayers={layers.length}
									styleEditorsProps={props}
								/>
							</div>
						)}
					</div>
				);
			})}

			<div className="_addLayerButton" onClick={e => e.stopPropagation()}>
				<button
					className="_addLayerButtonElement"
					onClick={handleAddLayerClick}
					onMouseDown={e => {
						console.log('Add layer button mouse down');
						e.stopPropagation();
						e.preventDefault();
					}}
				>
					Add Layer
				</button>
			</div>
		</div>
	);
}

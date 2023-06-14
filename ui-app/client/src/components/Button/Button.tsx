import React, { useEffect, useState } from 'react';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { addListener, getDataFromPath, PageStoreExtractor } from '../../context/StoreContext';
import { runEvent } from '../util/runEvent';
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './buttonProperties';
import ButtonStyle from './ButtonStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { flattenUUID } from '../util/uuid';
import { getHref } from '../util/getHref';
import { useLocation, useNavigate } from 'react-router-dom';
import { SubHelperComponent } from '../SubHelperComponent';
import { messageToMaster } from '../../slaveFunctions';

function ButtonComponent(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const [focus, setFocus] = useState(false);
	const [hover, setHover] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	let {
		key,
		properties: { label, onClick, type, readOnly, leftIcon, rightIcon, target, linkPath } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		props.definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		props.locationHistory,
		pageExtractor,
	);

	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;
	const spinnerPath = onClick
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onClick,
		  )}.isRunning`
		: undefined;

	const [isLoading, setIsLoading] = useState(
		onClick
			? getDataFromPath(spinnerPath, props.locationHistory, pageExtractor) ?? false
			: false,
	);

	useEffect(() => {
		if (spinnerPath) {
			return addListener((_, value) => setIsLoading(value), pageExtractor, spinnerPath);
		}
	}, []);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, hover, disabled: isLoading || readOnly },
		stylePropertiesWithPseudoStates,
	);

	const handleClick = async (e: any) => {
		if (linkPath) {
			if (target) {
				window.open(getHref(linkPath, location), target);
			} else {
				if (
					linkPath?.startsWith('http:') ||
					linkPath?.startsWith('https:') ||
					linkPath?.startsWith('//') ||
					linkPath?.startsWith('www')
				)
					window.location.href = linkPath;
				else navigate(getHref(linkPath, location));
			}
		}

		if (clickEvent && !isLoading)
			await runEvent(
				clickEvent,
				onClick,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			);
	};

	const rightIconTag =
		!type?.startsWith('fabButton') && type !== 'iconButton' && !leftIcon ? (
			<i
				style={styleProperties.rightIcon ?? {}}
				className={`rightButtonIcon ${rightIcon ?? 'fa fa-circle-notch hide'}`}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="rightIcon"
				></SubHelperComponent>
			</i>
		) : undefined;

	const leftIconTag = (
		<i
			style={styleProperties.leftIcon ?? {}}
			className={`leftButtonIcon ${
				leftIcon
					? !isLoading
						? leftIcon
						: 'fa fa-circle-notch fa-spin'
					: 'fa fa-circle-notch hide'
			}`}
		>
			<SubHelperComponent
				definition={props.definition}
				subComponentName="leftIcon"
			></SubHelperComponent>
		</i>
	);
	const [editableLabel, setEditableLabel] = useState(label);
	const [editName, setEditName] = useState(false);
	useEffect(() => setEditableLabel(label), [label]);
	label = getTranslations(label, props.pageDefinition.translations);
	return (
		<button
			className={`comp compButton button ${type}`}
			disabled={isLoading || readOnly}
			onClick={handleClick}
			style={styleProperties.comp ?? {}}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
			onFocus={stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined}
			onBlur={stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined}
			title={label ?? ''}
		>
			<HelperComponent definition={props.definition} onDoubleClick={() => setEditName(true)}>
				{editName && (
					<>
						<input
							type="text"
							className="nameEditor compButton"
							style={styleProperties.comp ?? {}}
							value={editableLabel}
							onKeyDown={ev => {
								if (ev.key === 'Enter') {
									ev.preventDefault();
									ev.stopPropagation();
									setEditName(false);
									messageToMaster({
										type: 'SLAVE_COMP_PROP_CHANGED',
										payload: {
											key: props.definition.key,
											properties: [{ name: 'label', value: editableLabel }],
										},
									});
								} else if (ev.key === 'Escape') {
									ev.preventDefault();
									ev.stopPropagation();
									setEditName(false);
									setEditableLabel(label);
								}
							}}
							onKeyUp={ev => {
								if (ev.key === ' ') {
									ev.preventDefault();
									ev.stopPropagation();
								}
							}}
							onChange={ev => {
								if (!ev.target) return;
								setEditableLabel(ev.target.value);
							}}
							onBlur={() => {
								setEditName(false);
								messageToMaster({
									type: 'SLAVE_COMP_PROP_CHANGED',
									payload: {
										key: props.definition.key,
										properties: [{ name: 'label', value: editableLabel }],
									},
								});
							}}
							autoFocus={true}
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onMouseDown={e => {
								e.stopPropagation();
							}}
							onMouseUp={e => {
								e.stopPropagation();
							}}
						/>
					</>
				)}
				<div
					className="textToolBar"
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
					}}
					onMouseDown={e => {
						e.preventDefault();
						e.stopPropagation();
					}}
					onMouseUp={e => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					<i
						className="fa fa-solid fa-bold"
						onClick={() => {
							messageToMaster({
								type: 'SLAVE_COMP_PROP_CHANGED',
								payload: {
									key: props.definition.key,
									styleProperties: [
										{ name: 'fontWeight', value: 'bold', strategy: 'toggle' },
									],
								},
							});
						}}
					/>
					<i
						className="fa fa-solid fa-italic"
						onClick={() => {
							messageToMaster({
								type: 'SLAVE_COMP_PROP_CHANGED',
								payload: {
									key: props.definition.key,
									styleProperties: [
										{ name: 'fontStyle', value: 'italic', strategy: 'toggle' },
									],
								},
							});
						}}
					/>
					<i
						className="fa fa-solid fa-strikethrough"
						onClick={() => {
							messageToMaster({
								type: 'SLAVE_COMP_PROP_CHANGED',
								payload: {
									key: props.definition.key,
									styleProperties: [
										{
											name: 'textDecoration',
											value: 'line-through',
											strategy: 'toggle',
										},
									],
								},
							});
						}}
					/>
					<i
						className="fa fa-solid fa-rotate-180 fa-underline"
						onClick={() => {
							messageToMaster({
								type: 'SLAVE_COMP_PROP_CHANGED',
								payload: {
									key: props.definition.key,
									styleProperties: [
										{
											name: 'textDecoration',
											value: 'overline',
											strategy: 'toggle',
										},
									],
								},
							});
						}}
					/>
					<i
						className="fa fa-solid fa-underline"
						onClick={() => {
							messageToMaster({
								type: 'SLAVE_COMP_PROP_CHANGED',
								payload: {
									key: props.definition.key,
									styleProperties: [
										{
											name: 'textDecoration',
											value: 'underline',
											strategy: 'toggle',
										},
									],
								},
							});
						}}
					/>
					<div className="colorPicker">
						<i className="fa fa-solid fa-palette" />
						<input
							type="color"
							onClick={e => {
								e.stopPropagation();
							}}
							onChange={e => {
								messageToMaster({
									type: 'SLAVE_COMP_PROP_CHANGED',
									payload: {
										key: props.definition.key,
										styleProperties: [
											{
												name: 'color',
												value: e.target.value,
											},
										],
									},
								});
							}}
						/>
					</div>
					<div className="colorPicker">
						<i className="fa fa-solid fa-fill-drip" />
						<input
							type="color"
							onClick={e => {
								e.stopPropagation();
							}}
							onChange={e => {
								messageToMaster({
									type: 'SLAVE_COMP_PROP_CHANGED',
									payload: {
										key: props.definition.key,
										styleProperties: [
											{
												name: 'backgroundColor',
												value: e.target.value,
											},
										],
									},
								});
							}}
						/>
					</div>
				</div>
			</HelperComponent>
			{leftIconTag}
			{!type?.startsWith('fabButton') && type !== 'iconButton' ? label : ''}
			{rightIconTag}
		</button>
	);
}

const component: Component = {
	icon: 'fa-solid fa-rectangle-ad',
	name: 'Button',
	displayName: 'Button',
	description: 'Button component',
	component: ButtonComponent,
	styleComponent: ButtonStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['focus', 'hover', 'disabled'],
	defaultTemplate: {
		key: '',
		name: 'button',
		type: 'Button',
		properties: {
			label: { value: 'Button' },
		},
	},
};

export default component;

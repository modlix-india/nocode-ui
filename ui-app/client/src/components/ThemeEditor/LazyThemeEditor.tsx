import { useEffect, useRef, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	getPathFromLocation,
	setData
} from '../../context/StoreContext';
import { ComponentProps, StyleResolution } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import ComponentDefinitions from '../index';
import useDefinition from '../util/useDefinition';
import { DesktopIcon, MobileIcon, TabletIcon } from './components/ThemeEditorIcons';
import { propertiesDefinition, stylePropertiesDefinition } from './themeEditorProperties';
import { Variables } from './components/Variables';

export default function ThemeEditor(props: Readonly<ComponentProps>) {

	const {
		pageDefinition: { translations },
		pageDefinition,
		definition: { bindingPath },
		locationHistory,
		definition,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [currentComponent, setCurrentComponent] = useState<string>('_app');
	const [device, setDevice] = useState<string>('DESKTOP');
	const [themeGroup, setThemeGroup] = useState<StyleResolution>(StyleResolution.ALL);

	const iFrameRef = useRef<HTMLIFrameElement>(null);

	const bindingPathPath =
		bindingPath && getPathFromLocation(bindingPath, locationHistory, pageExtractor);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [_, setChanged] = useState(Date.now());

	useEffect(() => {
		if (!bindingPathPath) return;

		function onMessageFromSlave(e: any) {
			const {
				data: { type },
			} = e;

			if (!type?.startsWith('SLAVE_') || !iFrameRef.current) return;

			if (type === 'SLAVE_STARTED') {
				iFrameRef.current?.contentWindow?.postMessage({
					type: 'EDITOR_TYPE',
					payload: { type: 'THEME_EDITOR' },
				});
				const msg = {
					type: 'EDITOR_APP_THEME',
					payload: getDataFromPath(bindingPathPath, locationHistory, pageExtractor),
				};
				iFrameRef.current?.contentWindow?.postMessage(msg);
			}
		}

		if (iFrameRef.current) {
			window.addEventListener('message', onMessageFromSlave);
		}

		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, payload) => {
				const msg = {
					type: 'EDITOR_APP_THEME',
					payload,
				};
				iFrameRef.current?.contentWindow?.postMessage(msg);
				setChanged(Date.now());
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, iFrameRef.current, setChanged]);

	useEffect(() => Array.from(ComponentDefinitions.values()).filter(e => e.externalStylePropsForThemeJson)
		.map(e => e.name).forEach(usedComponents.using), []);

	const theme = getDataFromPath(bindingPathPath, locationHistory, pageExtractor);

	const iframeComp = theme ? <iframe className={`_${device}`} ref={iFrameRef} src={`/${theme.appCode}/${theme.clientCode}/page/`} title="Theme Editor" /> : null;

	const modlix = <svg className="_iconHelperSVG " viewBox="0 0 453 453" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M363.87 0H88.63C39.681 0 0 39.681 0 88.63V363.87C0 412.819 39.681 452.5 88.63 452.5H363.87C412.819 452.5 452.5 412.819 452.5 363.87V88.63C452.5 39.681 412.819 0 363.87 0Z" fill="black" />
		<path d="M247.72 160.248V133.658L226.25 113.648L204.78 133.658V160.248C115.66 170.918 45.3503 247.088 44.3203 338.858H44.3503C59.0403 333.638 73.7303 328.418 88.4203 323.198C96.0303 261.688 143.85 212.638 204.77 203.188V278.418L226.26 263.188L247.7 278.418V203.188C308.62 212.638 356.45 261.688 364.05 323.198C378.74 328.418 393.43 333.638 408.12 338.858H408.15C407.12 247.088 336.81 170.918 247.69 160.248H247.72Z" fill="white" />
	</svg>;

	return <div className="comp compThemeEditor" style={resolvedStyles.comp ?? {}}>
		<HelperComponent context={context} definition={definition} />
		<div className="_variableContainer">
			<div className="_devices">
				<div
					className={`_icon ${device == 'DESKTOP' ? '_selected' : ''}`}
					title='Desktop'
					onClick={() => setDevice('DESKTOP')}
				>
					<DesktopIcon />
				</div>
				<div
					className={`_icon ${device == 'TABLET' ? '_selected' : ''}`}
					title='Tablet'
					onClick={() => setDevice('TABLET')}
				>
					<TabletIcon />
				</div>
				<div
					className={`_icon ${device == 'MOBILE' ? '_selected' : ''}`}
					title='Mobile'
					onClick={() => setDevice('MOBILE')}
				>
					<MobileIcon />
				</div>
				<select value={themeGroup} onChange={(e) => setThemeGroup(e.target.value as StyleResolution)}>
					{Object.values(StyleResolution).map(e => <option key={e} value={e}>{e}</option>)}
				</select>
			</div>
			<div className="_compsVariables">
				<div className="_components">
					<button onClick={() => setCurrentComponent('_app')} className={`_component ${currentComponent === '_app' ? '_active' : ''}`}>
						{modlix} App
					</button>
					<button onClick={() => setCurrentComponent('_message')} className={`_component ${currentComponent === '_message' ? '_active' : ''}`}>
						{modlix} Messages
					</button>
					{Array.from(ComponentDefinitions.values()).filter(e => e.stylePropertiesForTheme.length).filter(e => !e.isHidden).map(comp => (
						<button key={comp.name} onClick={() => setCurrentComponent(comp.name)} className={`_component ${comp.name === currentComponent ? '_active' : ''}`}>
							{comp.subComponentDefinition.find(e => e.mainComponent)?.icon}
							{comp.displayName}
						</button>
					))}
				</div>
				<Variables theme={theme} themeGroup={themeGroup} component={currentComponent}
					onThemeChange={(props) => {
						props.forEach(prop => setData(`${bindingPathPath}.variables.${prop.themeGroup}.${prop.variableName}`,
							prop.value == '' ? undefined : prop.value, context.pageName, true))
					}} />
			</div>
		</div>
		<div className={`_iframeContainer _${device}`}>
			{iframeComp}
		</div>
	</div>;
}
import React, { useEffect, useRef, useState } from 'react';
import { DRAG_COMP_NAME, TEMPLATE_DRAG } from '../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getDataFromPath,
} from '../../../context/StoreContext';
import { LocationHistory, PageDefinition, Section, Component } from '../../../types/common';
import ComponentDefinitions from '../../index';
import { PageOperations } from '../functions/PageOperations';
import axios from 'axios';

interface PinIconProps {
	isPinned: boolean;
	onClick: () => void;
}

const PinIcon: React.FC<PinIconProps> = ({ isPinned, onClick }) => {
	return (
		<div
			className={`_pinIcon ${isPinned ? 'pinned' : ''}`}
			onClick={e => {
				e.stopPropagation();
				onClick();
			}}
		>
			<svg
				width="10"
				height="10"
				viewBox="0 0 10 10"
				fill={isPinned ? 'currentColor' : 'none'}
				stroke="currentColor"
				strokeWidth={isPinned ? '1' : '0.5'}
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M5.9382 6.85515C5.90887 6.85515 5.87954 6.84343 5.85607 6.82L3.17582 4.13704C3.15236 4.1136 3.14062 4.08431 3.14062 4.05501C3.14062 4.02572 3.15236 3.99642 3.17582 3.97299L5.01735 2.13365L4.72406 1.84657C4.6478 1.7704 4.60087 1.66494 4.60087 1.55362C4.60087 1.44816 4.64193 1.3427 4.71819 1.26654L5.86746 0.118639C6.02583 -0.0395465 6.27807 -0.0395465 6.44231 0.118639L9.8789 3.55704C10.0373 3.70936 10.0373 3.97302 9.8789 4.1312L8.73544 5.2733C8.66505 5.34947 8.55946 5.39634 8.44801 5.39634C8.33656 5.39634 8.23684 5.34947 8.16058 5.2733L7.86729 4.98036L6.26633 6.57362L6.01997 6.81969C5.9965 6.84312 5.96717 6.85484 5.93784 6.85484L5.9382 6.85515ZM3.42212 4.055L5.9382 6.57388L6.10244 6.40983L7.78549 4.73458C7.83242 4.68771 7.90868 4.68771 7.9556 4.73458L8.33101 5.10955C8.36034 5.1447 8.40727 5.16227 8.44833 5.16227C8.49526 5.16227 8.53632 5.1447 8.57152 5.10955L9.71498 3.96745C9.75017 3.93229 9.76777 3.89128 9.76777 3.84441C9.76777 3.79168 9.75017 3.75067 9.71498 3.72137L6.2842 0.282973C6.20794 0.218526 6.10236 0.212667 6.03784 0.282973L4.88857 1.43087C4.85337 1.46017 4.83578 1.50118 4.83578 1.55391C4.83578 1.60078 4.85337 1.64179 4.88857 1.67695L5.26985 2.05192C5.28745 2.06949 5.30504 2.10465 5.30504 2.13394C5.30504 2.16323 5.29331 2.19253 5.26985 2.21596L3.58679 3.89122L3.42255 4.05526L3.42212 4.055Z"
					fill="black"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M5.84703 10.003C5.8177 10.003 5.78837 9.99129 5.76491 9.96785L0.0351948 4.23906C0.0117309 4.21562 0 4.18633 0 4.15703C0 4.12774 0.0117319 4.09845 0.0351948 4.07501C0.850544 3.25477 2.19928 3.11416 3.55387 3.7059C3.61253 3.72934 3.636 3.79964 3.61253 3.85823C3.58907 3.91681 3.51868 3.94611 3.46002 3.92268C2.24619 3.38952 1.04366 3.48327 0.287427 4.16289L5.84706 9.71589C6.52163 8.96596 6.61548 7.75947 6.08169 6.54117C6.05823 6.48259 6.08169 6.41228 6.14035 6.38885C6.19901 6.36541 6.26941 6.38885 6.29873 6.44744C6.88531 7.80632 6.7504 9.1538 5.92918 9.96783C5.91158 9.99126 5.88223 10.003 5.84703 10.003Z"
					fill="black"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M7.87379 4.93294C7.84446 4.93294 7.81513 4.92122 7.79167 4.89778L5.10551 2.21482C5.05858 2.17381 5.05858 2.09764 5.10551 2.05078C5.15243 2.00391 5.22283 2.00391 5.26975 2.05078L7.95591 4.73374C8.00284 4.78061 8.00284 4.85092 7.95591 4.89778C7.93245 4.92122 7.90312 4.93294 7.87379 4.93294Z"
					fill="black"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M0.468879 9.61411C0.43955 9.61411 0.41022 9.60239 0.386758 9.57896C0.339831 9.53209 0.339831 9.45592 0.386758 9.40905L2.88521 6.91357C2.93214 6.87256 3.00253 6.87256 3.04945 6.91357C3.09638 6.96044 3.09638 7.03661 3.04945 7.08348L0.550999 9.57896C0.527535 9.60239 0.498208 9.61411 0.468879 9.61411Z"
					fill="black"
				/>
			</svg>
		</div>
	);
};

export default function ComponentMenu({
	selectedComponent,
	defPath,
	locationHistory,
	pageExtractor,
	personalizationPath,
	onChangePersonalization,
	onCloseMenu,
	templateIframeRef,
	pageOperations,
	sectionsListConnectionName,
	sectionsCategoryList,
}: Readonly<{
	personalizationPath: string | undefined;
	selectedComponent: string | undefined;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	pageExtractor: PageStoreExtractor;
	onChangePersonalization: (prop: string, value: any) => void;
	onCloseMenu: () => void;
	templateIframeRef: (element: HTMLIFrameElement | undefined) => void;
	pageOperations: PageOperations;
	sectionsListConnectionName: string | undefined;
	sectionsCategoryList: any;
}>) {
	const [query, setQuery] = useState('');
	const [selectedComponentType, setSelectedComponentType] = useState('');
	const [selectedSectionCategory, setSelectedSectionCategory] = useState('');
	const [selectedTemplateSection, setSelectedTemplateSection] = useState<Section>();
	const [openCompMenu, setOpenCompMenu] = useState(false);
	const compMenuRef = useRef<HTMLDivElement>(null);
	const [theme, setTheme] = useState('light');
	const [originalCompType, setOriginalCompType] = useState('SECTIONS');
	const [sectionsList, setSectionsList] = useState<any>(null);
	const [pinnedComponents, setPinnedComponents] = useState(new Set());

	let compType = sectionsListConnectionName ? originalCompType : 'COMPONENTS';

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setOriginalCompType(v ?? 'SECTIONS'),
			pageExtractor,
			`${personalizationPath}.compMenuType`,
		);
	}, [personalizationPath]);

	const iframeRef = useRef<HTMLIFrameElement>(null);
	useEffect(() => {
		templateIframeRef(iframeRef.current ?? undefined);
		return () => templateIframeRef(undefined);
	}, [iframeRef.current]);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setTheme(v),
			pageExtractor,
			`${personalizationPath}.theme`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		const savedPinnedComponents = localStorage.getItem('pinnedComponents');
		if (savedPinnedComponents) {
			setPinnedComponents(new Set(JSON.parse(savedPinnedComponents)));
		}
	}, []);

	useEffect(() => {
		if (pinnedComponents.size > 0) {
			localStorage.setItem('pinnedComponents', JSON.stringify(Array.from(pinnedComponents)));
		}
	}, [pinnedComponents]);

	const handlePinComponent = (componentName: unknown) => {
		setPinnedComponents(prev => {
			const newPinned = new Set(prev);
			if (newPinned.has(componentName)) {
				newPinned.delete(componentName);
			} else {
				newPinned.add(componentName);
			}
			return newPinned;
		});
	};

	const sortComponents = (components: any[]) => {
		return components.sort(
			(
				a: { name: unknown; order: any; displayName: string },
				b: { name: unknown; order: any; displayName: any },
			) => {
				const aPinned = pinnedComponents.has(a.name);
				const bPinned = pinnedComponents.has(b.name);
				if (aPinned !== bPinned) {
					return bPinned ? 1 : -1;
				}
				if (a.order || b.order) {
					return (
						(a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
					);
				}
				return a.displayName.localeCompare(b.displayName);
			},
		);
	};

	const closeMenu = () => {
		setOpenCompMenu(false);
		compMenuRef.current?.classList.remove('foo');
		setTimeout(() => {
			onCloseMenu();
		}, 700);
	};

	useEffect(() => {
		const handle = setInterval(() => {
			if (!compMenuRef.current) return;
			setOpenCompMenu(true);
			clearInterval(handle);
		}, 100);
		return () => clearInterval(handle);
	}, [setOpenCompMenu, compMenuRef.current]);

	let compsList = undefined;

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => {
				const componentName = !v?.componentName
					? Array.from(ComponentDefinitions.values()).filter(e => !e.isHidden)[0]?.name
					: v.componentName;
				const comp = Array.from(ComponentDefinitions.values()).find(
					e => e.name === componentName,
				);
				const selectedSection = !v?.selectedSection
					? comp?.sections && comp.sections[0]
					: comp?.sections &&
						comp.sections.find(e => e.name === v?.selectedSection?.name);
				setSelectedComponentType(componentName);
				setSelectedTemplateSection(selectedSection);
			},
			pageExtractor,
			`${personalizationPath}.selectedComponent`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setSelectedSectionCategory(v ?? ''),
			pageExtractor,
			`${personalizationPath}.selectedSectionCategory`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!selectedSectionCategory) {
			setSectionsList(null);
			return;
		}

		(async () => {
			const sections = await axios(`api/core/function/execute/CoreServices.REST/GetRequest`, {
				method: 'POST',
				data: {
					connectionName: sectionsListConnectionName,
					url: `/api/core/function/execute/Items/ReadPageWithLatestVersion?type=Section&category=${selectedSectionCategory}`,
				},
			});
			setSectionsList(sections.data?.[0]?.result?.data?.[0]?.result?.list);
		})();
	}, [selectedSectionCategory]);

	if (!selectedComponent) {
		compsList = Array.from(ComponentDefinitions.values()).filter(
			e => !e.parentType && !e.isHidden,
		);
	} else {
		const def: PageDefinition = getDataFromPath(defPath, locationHistory, pageExtractor);
		const compDef = def.componentDefinition[selectedComponent];
		const component: Component | undefined = ComponentDefinitions.get(compDef?.type);
		if (component?.allowedChildrenType && !component?.allowedChildrenType.has('')) {
			compsList = Array.from(ComponentDefinitions.values()).filter(
				e => component.allowedChildrenType?.has(e.name) && !e.isHidden,
			);
		} else {
			compsList = Array.from(ComponentDefinitions.values()).filter(
				e => (!e.parentType || e.parentType === compDef?.type) && !e.isHidden,
			);
		}
	}
	let pattern = query
		.split('')
		.map(x => {
			return `(?=.*${x})`;
		})
		.join('');
	let regex = new RegExp(`${pattern}`, 'gi');

	const compList =
		compType === 'COMPONENTS'
			? sortComponents(compsList)
					.filter(
						f =>
							regex.exec(f.displayName.toLowerCase()) ||
							regex.exec(f.name.toLowerCase()),
					)
					.map(e => (
						<div
							key={e.name}
							className={`_compMenuItem ${
								selectedComponentType === e.name ? 'active' : ''
							}`}
							title={e.description}
							onClick={() =>
								onChangePersonalization('selectedComponent', {
									componentName: e.name,
									selectedSection: e.sections ? e.sections[0] : undefined,
								})
							}
							onDoubleClick={() => {
								if (!selectedComponent) return;
								pageOperations.droppedOn(
									selectedComponent,
									`${DRAG_COMP_NAME}${e.name}`,
								);
								closeMenu();
							}}
							draggable={true}
							onDragStart={ev =>
								ev.dataTransfer.items.add(
									`${DRAG_COMP_NAME}${e.name}`,
									'text/plain',
								)
							}
							onDragOver={e => {
								e.preventDefault();
								closeMenu();
							}}
						>
							<PinIcon
								isPinned={pinnedComponents.has(e.name)}
								onClick={() => handlePinComponent(e.name)}
							/>
							{typeof e.subComponentDefinition?.[0].icon === 'string' ? (
								<i className={`fa ${e.subComponentDefinition?.[0].icon}`} />
							) : (
								e.subComponentDefinition?.[0].icon
							)}
							{e.displayName}
						</div>
					))
			: sectionsCategoryList?.map((e: any) => (
					<div
						key={e.name}
						className={`_compMenuItem ${selectedSectionCategory === e._id ? 'active' : ''}`}
						title={e.name}
						onClick={() => onChangePersonalization('selectedSectionCategory', e._id)}
						onDragStart={ev =>
							ev.dataTransfer.items.add(`${DRAG_COMP_NAME}${e.name}`, 'text/plain')
						}
					>
						<img className="actual" src={e.image} />
						<img className="hover" src={e.hoverImage} />
						{e.name}
					</div>
				));

	let tempSections: any =
		(selectedComponentType && compType === 'COMPONENTS'
			? compsList.find(e => e.name === selectedComponentType)
			: undefined
		)?.sections ?? [];

	let rightPart = <></>;

	if (compType === 'SECTIONS' && sectionsList?.content?.length) {
		rightPart = (
			<div
				className={`_popupMenuContainer _compMenu ${
					openCompMenu ? '_show' : ''
				} _compMenuRight _sections`}
			>
				{sectionsList.content.map((e: any) => (
					<div
						className="_sectionThumb"
						style={{ backgroundImage: `url('${e.thumbnail}')` }}
						draggable={true}
						onDragStart={ev =>
							ev.dataTransfer.items.add(
								`${TEMPLATE_DRAG}${JSON.stringify({
									mainKey: e.version.definition.rootComponent,
									objects: e.version.definition.componentDefinition,
								})}`,
								'text/plain',
							)
						}
						onDoubleClick={() => {
							if (!selectedComponent) return;
							pageOperations.droppedOn(
								selectedComponent,
								`${TEMPLATE_DRAG}${JSON.stringify({
									mainKey: e.version.definition.rootComponent,
									objects: e.version.definition.componentDefinition,
								})}`,
							);
							closeMenu();
						}}
					/>
				))}
			</div>
		);
	} else if (selectedComponentType && tempSections.length) {
		rightPart = (
			<div
				className={`_popupMenuContainer _compMenu ${
					openCompMenu ? '_show' : ''
				} _compMenuRight`}
			>
				<div className="_compTemplateSections">
					<div className="_tabContainer">
						{tempSections.map((e: Section) => (
							<button
								key={e.name}
								onClick={() => {
									onChangePersonalization('selectedComponent', {
										componentName: selectedComponentType,
										selectedSection: e,
									});
								}}
								className={`_tab ${
									e.name === selectedTemplateSection?.name ? '_selected' : ''
								}`}
							>
								{e.name}
							</button>
						))}
					</div>
				</div>
				{selectedTemplateSection && (
					<iframe
						name="templateIframe"
						title="Template"
						ref={iframeRef}
						src={`/editortemplates/SYSTEM/page/${selectedTemplateSection?.pageName}`}
						style={{ border: '0' }}
					/>
				)}
			</div>
		);
	} else {
		rightPart = <div className={`_popupMenuContainer _compMenu _compMenuRight`}></div>;
	}

	const sectionsTab = sectionsListConnectionName ? (
		<button
			className={`_tab ${compType === 'SECTIONS' ? '_selected' : ''}`}
			onClick={() => {
				setOriginalCompType('SECTIONS');
				onChangePersonalization('compMenuType', 'SECTIONS');
			}}
		>
			Sections
		</button>
	) : (
		<></>
	);

	return (
		<div
			className={`_popupMenuBackground ${theme}`}
			onMouseDown={e => e.target === e.currentTarget && closeMenu()}
			onDrop={() => {}}
			onDragOver={e => e.target === e.currentTarget && closeMenu()}
		>
			<div
				className={`_popupMenuContainer _compMenu ${openCompMenu ? '_show' : ''}`}
				ref={compMenuRef}
			>
				<div className="_left">
					<div className="_tabContainerContainer">
						<div className="_tabContainer">
							{sectionsTab}
							<button
								className={`_tab ${compType !== 'SECTIONS' ? '_selected' : ''}`}
								onClick={() => {
									setOriginalCompType('COMPONENTS');
									onChangePersonalization('compMenuType', 'COMPONENTS');
								}}
							>
								Elements
							</button>
						</div>
					</div>
					{compType === 'COMPONENTS' && (
						<input
							className="_compMenuSearch"
							type="text"
							placeholder="Search"
							onChange={e => setQuery(e.target.value)}
							value={query}
						/>
					)}
					<div className="_compList">{compList}</div>
				</div>
			</div>
			{rightPart}
		</div>
	);
}

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
import getSrcUrl from '../../util/getSrcUrl';

interface PinIconProps {
	isPinned: boolean;
	onClick: () => void;
}

function PinIcon({ isPinned, onClick }: Readonly<PinIconProps>) {
	return (
		<button
			className={`_pinIcon ${isPinned ? 'pinned' : ''}`}
			onClick={e => {
				e.stopPropagation();
				onClick();
			}}
		>
			<svg width="15" height="15" viewBox="0 0 10 10">
				<path
					d="M5.15518 1.46233C5.35074 1.26677 5.65915 1.25919 5.84533 1.44537L8.53807 4.13811C8.72425 4.32429 8.71667 4.6327 8.52111 4.82826C8.32555 5.02382 8.01714 5.0314 7.83096 4.84522L7.52067 4.53492L6.00318 6.29223C6.16935 6.89812 6.10647 7.57108 5.79311 8.17475L5.77048 8.21841C5.69692 8.3614 5.56082 8.46174 5.406 8.49033C5.25119 8.51892 5.09392 8.47213 4.98558 8.36379L1.61965 4.99786C1.5113 4.88952 1.46446 4.7344 1.49311 4.57743C1.52175 4.42046 1.62314 4.28541 1.76503 4.21295L1.80869 4.19033C2.41236 3.87697 3.08531 3.81409 3.69121 3.98025L5.44852 2.46277L5.13822 2.15247C4.95204 1.96629 4.95962 1.65789 5.15518 1.46233ZM2.61246 6.69779L3.28565 7.37097L2.22499 8.43163C2.02943 8.62719 1.72102 8.63477 1.53484 8.44859C1.34867 8.26241 1.35624 7.954 1.5518 7.75845L2.61246 6.69779Z"
					fill={isPinned ? '#4C7FEE' : '#EDEAEA'}
				/>
			</svg>
		</button>
	);
}

// Add new tutorial icons component
interface TutorialIconsProps {
	showTutorial: boolean;
	demoVideo?: string;
	description?: string;
	youtubeLink?: string;
	onInfoClick: () => void;
}

function TutorialIcons({
	showTutorial,
	demoVideo,
	description,
	youtubeLink,
	onInfoClick,
}: TutorialIconsProps) {
	if (!showTutorial) return null;

	return (
		<div className="_tutorialIcons">
			{(demoVideo || description) && (
				<i
					className="fa-solid fa-info-circle"
					onClick={e => {
						e.stopPropagation();
						onInfoClick();
					}}
				/>
			)}
			{youtubeLink && (
				<a
					href={youtubeLink}
					target="_blank"
					rel="noopener noreferrer"
					className="_youtubeIcon"
					onClick={e => e.stopPropagation()}
				>
					<i className="fa-brands fa-youtube" />
				</a>
			)}
		</div>
	);
}

interface TutorialTooltipProps {
	componentName?: string;
	demoVideo?: string;
	description?: string;
	onClose: () => void;
	style?: React.CSSProperties;
}

function TutorialTooltip({
	componentName,
	demoVideo,
	description,
	onClose,
	style,
}: TutorialTooltipProps) {
	const isYoutubeVideo = demoVideo?.includes('youtube.com') || demoVideo?.includes('youtu.be');

	return (
		<div
			className="_tutorialTooltipContainer"
			style={style}
			onMouseDown={e => e.target === e.currentTarget && onClose()}
			role="dialog"
			aria-modal="true"
			onKeyDown={e => (e.key === 'Escape' || e.key === 'tab') && onClose()}
			tabIndex={6}
		>
			<div className="_tutorialTooltipPanel">
				<div className="_tutorialHeader">
					<h3>{componentName ? `${componentName} Tutorial` : 'Component Tutorial'}</h3>
					<i className="fa-solid fa-circle-xmark" onClick={onClose} />
				</div>
				{demoVideo && (
					<div className="_videoContainer">
						{isYoutubeVideo ? (
							<iframe
								src={demoVideo.replace('watch?v=', 'embed/')}
								title="YouTube video player"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						) : (
							<video autoPlay loop muted playsInline>
								<source src={demoVideo} type="video/mp4" />
							</video>
						)}
					</div>
				)}
				{description && <div className="_descriptionT">{description}</div>}
			</div>
		</div>
	);
}

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
	const [showTutorialHelp, setShowTutorialHelp] = useState(false);
	const [activeTutorial, setActiveTutorial] = useState<string | null>(null);

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
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => {
				if (v) {
					setPinnedComponents(new Set(v));
				} else {
					setPinnedComponents(new Set());
				}
			},
			pageExtractor,
			`${personalizationPath}.pinnedComponents`,
		);
	}, [personalizationPath]);

	const handlePinComponent = (componentName: unknown) => {
		setPinnedComponents(prev => {
			const newPinned = new Set(prev);
			if (newPinned.has(componentName)) {
				newPinned.delete(componentName);
			} else {
				newPinned.add(componentName);
			}
			onChangePersonalization('pinnedComponents', Array.from(newPinned));
			return newPinned;
		});
	};

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setShowTutorialHelp(v ?? false),
			pageExtractor,
			`${personalizationPath}.showTutorialHelp`,
		);
	}, [personalizationPath]);

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
							<TutorialIcons
								showTutorial={showTutorialHelp}
								demoVideo={e.tutorial?.demoVideo}
								description={e.tutorial?.description}
								youtubeLink={e.tutorial?.youtubeLink}
								onInfoClick={() => setActiveTutorial(e.name)}
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
						<img className="actual" src={getSrcUrl(e.image)} />
						<img className="hover" src={getSrcUrl(e.hoverImage)} />
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
					<div className="_filterBar">
						<div className="_tutorialToggle">
							<label>
								Looking for Tutorial Help?
								<div
									role="button"
									tabIndex={0}
									className={`_toggleButton ${showTutorialHelp ? '_on' : '_off'}`}
									onClick={() => {
										onChangePersonalization(
											'showTutorialHelp',
											!showTutorialHelp,
										);
									}}
								/>
							</label>
						</div>
					</div>
					<div className="_compList">{compList}</div>
				</div>
			</div>
			{rightPart}
			{activeTutorial && (
				<TutorialTooltip
					componentName={compsList.find(e => e.name === activeTutorial)?.displayName}
					demoVideo={compsList.find(e => e.name === activeTutorial)?.tutorial?.demoVideo}
					description={
						compsList.find(e => e.name === activeTutorial)?.tutorial?.description
					}
					onClose={() => setActiveTutorial(null)}
					style={{
						position: 'absolute',
						left: '320px',
						top: '50%',
						transform: 'translateY(-50%)',
					}}
				/>
			)}
		</div>
	);
}

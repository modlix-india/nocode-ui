import React, { useEffect, useRef, useState } from 'react';
import { DRAG_COMP_NAME, TEMPLATE_DRAG } from '../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getDataFromPath,
} from '../../../context/StoreContext';
import {
	LocationHistory,
	PageDefinition,
	Section,
	Component,
	Tutorial,
} from '../../../types/common';
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
			<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
				<path
					d="M5.05093 0.863767C5.29538 0.619318 5.68089 0.609844 5.91361 0.842566L9.27954 4.2085C9.51226 4.44122 9.50279 4.82673 9.25834 5.07118C9.01389 5.31563 8.62838 5.3251 8.39566 5.09238L8.00779 4.70451L6.11093 6.90114C6.31864 7.65851 6.24004 8.4997 5.84834 9.25429L5.82006 9.30887C5.7281 9.48761 5.55798 9.61303 5.36446 9.64877C5.17094 9.68451 4.97435 9.62602 4.83892 9.4906L0.631511 5.28318C0.496085 5.14776 0.437535 4.95386 0.473341 4.75765C0.509146 4.56144 0.635884 4.39263 0.813236 4.30205L0.867817 4.27377C1.6224 3.88207 2.4636 3.80347 3.22097 4.01117L5.4176 2.11432L5.02973 1.72645C4.79701 1.49373 4.80648 1.10822 5.05093 0.863767ZM1.87253 7.40809L2.71402 8.24957L1.38819 9.5754C1.14374 9.81985 0.758231 9.82932 0.525509 9.5966C0.292786 9.36388 0.30226 8.97837 0.546709 8.73392L1.87253 7.40809Z"
					fill={isPinned ? '#4C7FEE' : '#EDEAEA'}
				/>
			</svg>
		</button>
	);
}

interface TutorialIconsProps {
	tutorial?: Tutorial;
	onInfoClick: () => void;
}

function TutorialIcons({ tutorial, onInfoClick }: TutorialIconsProps) {
	if (!tutorial?.demoVideo && !tutorial?.description && !tutorial?.youtubeLink) return null;

	return (
		<button
			className="_tutorialIcon"
			onClick={e => {
				e.stopPropagation();
				onInfoClick();
			}}
		>
			<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
				<path
					d="M8.51245 1.51684L8.0351 1.38966C6.68503 1.02993 6.00997 0.850076 5.47817 1.15538C4.94635 1.46069 4.76547 2.13194 4.40372 3.47443L3.89211 5.373C3.53035 6.71547 3.34947 7.38673 3.65651 7.91553C3.96355 8.44437 4.6386 8.62419 5.98872 8.98392L6.46606 9.11113C7.81613 9.47082 8.4912 9.65068 9.02299 9.34541C9.55479 9.04008 9.73571 8.36882 10.0974 7.02635L10.609 5.12777C10.9708 3.78528 11.1517 3.11403 10.8447 2.58522C10.5376 2.05642 9.86257 1.87655 8.51245 1.51684Z"
					fill="#EDEAEA"
					stroke="#EDEAEA"
				/>
				<path
					d="M8.4276 3.71559C8.4276 4.12267 8.09572 4.45267 7.68634 4.45267C7.27695 4.45267 6.94507 4.12267 6.94507 3.71559C6.94507 3.30852 7.27695 2.97852 7.68634 2.97852C8.09572 2.97852 8.4276 3.30852 8.4276 3.71559Z"
					stroke="white"
				/>
				<path
					d="M6.00045 10.4738L5.52426 10.6034C4.1773 10.9702 3.50384 11.1536 2.97327 10.8423C2.44272 10.531 2.26226 9.84662 1.90135 8.47779L1.39095 6.54197C1.03003 5.17314 0.849577 4.48874 1.1559 3.94955C1.42087 3.48315 2.00009 3.50013 2.75016 3.50007"
					stroke="#EDEAEA"
					strokeLinecap="round"
				/>
			</svg>
		</button>
	);
}

interface TutorialTooltipProps {
	componentName?: string;
	tutorial?: Tutorial;
	onClose: () => void;
	style?: React.CSSProperties;
}

function getYoutubeEmbedUrl(url: string): string {
	try {
		const videoUrl = new URL(url);
		if (videoUrl.hostname === 'youtu.be') {
			const videoId = videoUrl.pathname.replace(/^\//, '');
			return `https://www.youtube.com/embed/${videoId}`;
		}
		if (videoUrl.hostname.includes('youtube.com')) {
			const videoId = videoUrl.searchParams.get('v');
			if (videoId) {
				return `https://www.youtube.com/embed/${videoId}`;
			}
		}
		return url;
	} catch {
		return url;
	}
}

function TutorialTooltip({ componentName, tutorial, onClose, style }: TutorialTooltipProps) {
	const isYoutubeVideo =
		tutorial?.demoVideo?.includes('youtube.com') || tutorial?.demoVideo?.includes('youtu.be');

	return (
		<div
			className="_tutorialTooltipContainer"
			style={style}
			onMouseDown={e => e.target === e.currentTarget && onClose()}
			role="dialog"
			aria-modal="true"
			onKeyDown={e => e.key === 'Escape' && onClose()}
			tabIndex={0}
		>
			<div className="_tutorialTooltipPanel">
				<div className="_tutorialCloser">
					<svg
						width="6"
						height="6"
						viewBox="0 0 6 6"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						onClick={onClose}
					>
						<path
							d="M5.82243 1.02468C6.05669 0.790411 6.05669 0.409964 5.82243 0.175699C5.58816 -0.0585663 5.20771 -0.0585663 4.97345 0.175699L3 2.15102L1.02468 0.177573C0.790411 -0.0566922 0.409964 -0.0566922 0.175699 0.177573C-0.0585663 0.411838 -0.0585663 0.792285 0.175699 1.02655L2.15102 3L0.177573 4.97532C-0.0566921 5.20959 -0.0566921 5.59004 0.177573 5.8243C0.411838 6.05857 0.792285 6.05857 1.02655 5.8243L3 3.84898L4.97532 5.82243C5.20959 6.05669 5.59004 6.05669 5.8243 5.82243C6.05857 5.58816 6.05857 5.20771 5.8243 4.97345L3.84898 3L5.82243 1.02468Z"
							fill="black"
						/>
					</svg>
				</div>
				{tutorial?.demoVideo && (
					<div className="_videoContainer">
						{isYoutubeVideo ? (
							<iframe
								src={getYoutubeEmbedUrl(tutorial.demoVideo)}
								title="YouTube video player"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						) : (
							<video className="_video" autoPlay loop muted playsInline>
								<source src={tutorial.demoVideo} type="video/mp4" />
							</video>
						)}
					</div>
				)}
				<div className="_tutorialHeader">
					<h3>{componentName ? `${componentName} Tutorial` : 'Component Tutorial'}</h3>
				</div>
				{tutorial?.description && (
					<div className="_tutorialHeader">{tutorial.description}</div>
				)}

				{tutorial?.youtubeLink && (
					<div className="_youtubeButtonContainer">
						<a
							href={tutorial.youtubeLink}
							target="_blank"
							rel="noopener noreferrer"
							className="_youtubeButton"
						>
							Watch tutorial on
							<svg
								width="54"
								height="12"
								viewBox="0 0 54 12"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								xmlnsXlink="http://www.w3.org/1999/xlink"
							>
								<rect width="54" height="12" fill="url(#pattern0_1145_2802)" />
								<defs>
									<pattern
										id="pattern0_1145_2802"
										patternContentUnits="objectBoundingBox"
										width="1"
										height="1"
									>
										<use
											xlinkHref="#image0_1145_2802"
											transform="matrix(0.00125945 0 0 0.00566751 0 -0.00440806)"
										/>
									</pattern>
									<image
										id="image0_1145_2802"
										width="794"
										height="178"
										preserveAspectRatio="none"
										xlinkHref="data:image/png;base64,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"
									/>
								</defs>
							</svg>
						</a>
					</div>
				)}
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
	const [activeTutorialComponentName, setActiveTutorialComponentName] = useState<string | null>(
		null,
	);

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

	const handlePinComponent = (componentName: string) => {
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
								tutorial={e.tutorial}
								onInfoClick={() => setActiveTutorialComponentName(e.name)}
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
					<div className="_compList">{compList}</div>
				</div>
			</div>
			{rightPart}
			{activeTutorialComponentName &&
				(() => {
					const activeComp = compsList.find(
						component => component.name === activeTutorialComponentName,
					);
					return (
						<TutorialTooltip
							componentName={activeComp?.displayName}
							tutorial={activeComp?.tutorial}
							onClose={() => setActiveTutorialComponentName(null)}
							style={{
								position: 'absolute',
								left: '320px',
								top: '50%',
								transform: 'translateY(-50%)',
							}}
						/>
					);
				})()}
		</div>
	);
}

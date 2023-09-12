import React, { useCallback, useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
} from '../../../../context/StoreContext';
import { ComponentPropertyDefinition } from '../../../../types/common';
import Portal from '../../../Portal';
import { Dropdown } from '../stylePropertyValueEditors/simpleEditors/Dropdown';

interface IconSelectionEditorProps2 {
	appPath: string | undefined;
	value?: string;
	propDef: ComponentPropertyDefinition;
	pageExtractor: PageStoreExtractor;
	onChange: (v: string | undefined) => void;
}

const OPTIONS = [
	[
		{ icon: 'ms material-symbols-outlined mso-pen_size_1', className: '_thinner' },
		{ icon: 'ms material-symbols-outlined mso-pen_size_2', className: '_thins' },
		{ icon: 'ms material-symbols-outlined mso-pen_size_3', className: '_light' },
		{ icon: 'ms material-symbols-outlined mso-pen_size_3 _bold', className: '_regular' },
		{ icon: 'ms material-symbols-outlined mso-pen_size_4', className: '_medium' },
		{ icon: 'ms material-symbols-outlined mso-pen_size_4 _medium', className: '_semiBold' },
		{ icon: 'ms material-symbols-outlined mso-pen_size_5', className: '_bold' },
		{ icon: 'ms material-symbols-outlined mso-pen_size_5 _bold', className: '_extraBold' },
	],
	[
		{ icon: 'ms material-symbols-outlined mso-counter_1', className: '_size1' },
		{ icon: 'ms material-symbols-outlined mso-counter_2', className: '_size2' },
		{ icon: 'ms material-symbols-outlined mso-counter_3', className: '_size3' },
		{ icon: 'ms material-symbols-outlined mso-counter_4', className: '_size4' },
		{ icon: 'ms material-symbols-outlined mso-counter_5', className: '_size5' },
		{ icon: 'ms material-symbols-outlined mso-counter_6', className: '_size6' },
		{ icon: 'ms material-symbols-outlined mso-counter_7', className: '_size7' },
		{ icon: 'ms material-symbols-outlined mso-counter_8', className: '_size8' },
	],
	[
		{ icon: 'ms material-symbols-outlined mso-clock_loader_10', className: '_rotate-45' },
		{
			icon: 'ms material-symbols-outlined mso-clock_loader_10 _rotate-45',
			className: '_rotate-90',
		},
		{
			icon: 'ms material-symbols-outlined mso-clock_loader_10 _rotate-90',
			className: '_rotate-135',
		},
		{
			icon: 'ms material-symbols-outlined mso-clock_loader_10 _rotate-135',
			className: '_rotate-180',
		},
		{
			icon: 'ms material-symbols-outlined mso-clock_loader_10 _rotate-180',
			className: '_rotate-225',
		},
		{
			icon: 'ms material-symbols-outlined mso-clock_loader_10 _rotate-225',
			className: '_rotate-270',
		},
		{
			icon: 'ms material-symbols-outlined mso-clock_loader_10 _rotate-270',
			className: '_rotate-315',
		},
	],

	[
		{ icon: 'ms material-symbols-outlined mso-flip _rotate-90', className: '_flip-y' },
		{ icon: 'ms material-symbols-outlined mso-flip', className: '_flip-x' },
	],
];

const ALL_OPTIONS = OPTIONS.reduce((a, c) => [...a, ...c], []).map(o => o.className);

const dataMap = new Map([
	[
		'FREE_FONT_AWESOME_ALL',
		'https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/FREE_FONT_AWESOME_ALL/font.json',
	],
	[
		'MATERIAL_SYMBOLS_OUTLINED',
		'https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_SYMBOLS/font.json',
	],
	[
		'MATERIAL_SYMBOLS_ROUNDED',
		'https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_SYMBOLS/font.json',
	],
	[
		'MATERIAL_SYMBOLS_SHARP',
		'https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_SYMBOLS/font.json',
	],
	[
		'MATERIAL_ICONS_FILLED',
		'https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_ICONS/font.json',
	],
	[
		'MATERIAL_ICONS_OUTLINED',
		'https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_ICONS/font.json',
	],
	[
		'MATERIAL_ICONS_ROUNDED',
		'https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_ICONS/font.json',
	],
	[
		'MATERIAL_ICONS_SHARP',
		'https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_ICONS/font.json',
	],
	[
		'MATERIAL_ICONS_TWO_TONE',
		'https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_ICONS/font.json',
	],
]);

const prefixMap = new Map([
	['FREE_FONT_AWESOME_ALL', 'fa'],
	['MATERIAL_SYMBOLS_OUTLINED', 'ms material-symbols-outlined'],
	['MATERIAL_SYMBOLS_ROUNDED', 'ms material-symbols-rounded'],
	['MATERIAL_SYMBOLS_SHARP', 'ms material-symbols-sharp'],
	['MATERIAL_ICONS_FILLED', 'mi material-icons'],
	['MATERIAL_ICONS_OUTLINED', 'mi material-icons-outlined'],
	['MATERIAL_ICONS_ROUNDED', 'mi material-icons-round'],
	['MATERIAL_ICONS_SHARP', 'mi material-icons-sharp'],
	['MATERIAL_ICONS_TWO_TONE', 'mi material-icons-two-tone'],
]);

const packData = new Map<string, Promise<[{ n: string; d: string; k: string }]>>();

function getPackData(pack: string): Promise<[{ n: string; d: string; k: string }]> {
	if (packData.has(pack)) return packData.get(pack)!;
	const url = dataMap.get(pack)!;
	const data = new Promise<[{ n: string; d: string; k: string }]>((resolve, reject) => {
		fetch(url).then(res => res.json().then(resolve).catch(reject));
	});
	packData.set(pack, data);
	return data;
}

export function IconSelectionEditor2({
	value,
	onChange,
	propDef,
	appPath,
	pageExtractor,
}: IconSelectionEditorProps2) {
	const [packs, setPacks] = useState<string[]>([]);
	const [selectedPack, setSelectedPack] = useState<string>('');

	const [packJson, setPackJson] = useState<Array<{ n: string; d: string; k: string }>>([]);

	// Checking if someone changed the app data
	useEffect(() => {
		if (!appPath) return;

		return addListenerAndCallImmediately(
			(_, p) => {
				const ps = Object.values(p ?? {}).map((e: any) => e.name);
				setPacks(ps);
				if (ps.length && !selectedPack) {
					setSelectedPack(ps[0]);
					getPackData(ps[0]).then(x => setPackJson(x));
				}
			},
			pageExtractor,
			`${appPath}.properties.iconPacks`,
		);
	}, [appPath, pageExtractor, setPacks, setSelectedPack, setPackJson, selectedPack]);

	const [chngValue, setChngValue] = useState(value ?? '');
	const [showIconBrowser, setShowIconBrowser] = useState(false);
	const [filter, setFilter] = useState('');

	useEffect(() => setChngValue(value ?? ''), [value]);

	const updatePackData = useCallback(
		(pack: string) => {
			setSelectedPack(pack);
			getPackData(pack).then(x => setPackJson(x));
		},
		[setPackJson],
	);

	let popup = <></>;

	if (showIconBrowser) {
		popup = (
			<Portal>
				<div className={`_popupBackground`} onClick={() => setShowIconBrowser(false)}>
					<div className="_popupContainer" onClick={e => e.stopPropagation()}>
						<div className="_iconSelectionBrowser">
							<div className="_selectors">
								Icon Pack :
								<Dropdown
									value={selectedPack}
									onChange={updatePackData}
									options={packs.map(p => ({
										name: p,
										displayName: p,
									}))}
								/>
								Search :
								<input
									className="_peInput"
									placeholder="Search for icons..."
									type="text"
									value={filter}
									onChange={e => setFilter(e.target.value)}
								/>
							</div>
							<div className="_iconSelectionDisplay">
								{(filter
									? packJson.filter(i => i.k.includes(filter))
									: packJson.slice(0, 30)
								).map((i, index) => {
									return (
										<div
											key={`${i.n} ${index}`}
											className="_eachIcon"
											onClick={() => {
												let v =
													chngValue === '' ||
													chngValue === propDef.defaultValue
														? ''
														: chngValue;

												onChange(
													v
														.split(' ')
														.filter(
															e =>
																prefixMap.has(e) ||
																ALL_OPTIONS.includes(e),
														)
														.join(' ') +
														' ' +
														`${prefixMap.get(selectedPack)} ${i.n}`,
												);
												setShowIconBrowser(false);
											}}
										>
											<i
												className={`${prefixMap.get(selectedPack)} _size3 ${
													i.n
												}`}
											/>
											{i.d}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</Portal>
		);
	}

	return (
		<div className="_iconSelectionEditor">
			<div className="_pvExpressionEditor">
				<input
					type="text"
					className="_peInput"
					value={chngValue}
					placeholder={propDef.defaultValue}
					onChange={e => setChngValue(e.target.value)}
					onBlur={() =>
						onChange(
							chngValue === '' || chngValue === propDef.defaultValue
								? undefined
								: chngValue,
						)
					}
				/>
				<i
					className="_pillTag fa fa-search"
					tabIndex={0}
					onClick={() => setShowIconBrowser(true)}
				/>
			</div>
			<div className="_iconSelectionButtons">
				Style:
				{generateButtons(chngValue, OPTIONS[0], onChange)}
			</div>
			<div className="_iconSelectionButtons">
				Size:
				{generateButtons(chngValue, OPTIONS[1], onChange)}
			</div>
			<div className="_iconSelectionButtons">
				Rotate:
				{generateButtons(chngValue, OPTIONS[2], onChange)}
			</div>
			<div className="_iconSelectionButtons">
				Flip:
				{generateButtons(chngValue, OPTIONS[3], onChange)}
			</div>
			{popup}
		</div>
	);
}

function generateButtons(
	value: string,
	options: {
		icon: string;
		className: string;
	}[],
	onChange: (v: string | undefined) => void,
): JSX.Element[] {
	return options.map((option, i) => (
		<i
			key={option.className}
			className={`_iconSelectionButton ${option.icon} ${
				value.includes(option.className) ? 'active' : ''
			}`}
			onClick={() => onChange(clean(value, options, option.className))}
		/>
	));
}

function clean(
	value: string,
	options: {
		icon: string;
		className: string;
	}[],
	currentOption: string,
): string {
	if (value.includes(currentOption)) return value.replace(currentOption, '');
	return (
		options
			.reduce((a, c) => {
				if (!value) return '';
				return a.replace(c.className, '');
			}, value)
			.trim() +
		' ' +
		currentOption
	);
}

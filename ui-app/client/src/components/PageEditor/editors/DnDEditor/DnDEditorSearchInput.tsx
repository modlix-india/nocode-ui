import React from 'react';

interface DnDEditorSearchInputProp {
	filter: string;
	setFilter: (v: React.SetStateAction<string>) => void;
	filterHandle: NodeJS.Timeout | undefined;
	setFilterHandle: (v: React.SetStateAction<NodeJS.Timeout | undefined>) => void;
	applyFilter: (v: string) => void;
	expandAll: boolean;
	setExpandAll: (v: React.SetStateAction<boolean>) => void;
	setOpenParents: (v: React.SetStateAction<Set<string>>) => void;
	showOptions: boolean | undefined;
	setShowOptions: React.Dispatch<React.SetStateAction<boolean | undefined>>;
	selectedOption: string;
	setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
	searchOptions: string[];
	filteredComponentList: string[] | undefined;
	onSelectedComponentListChanged: (key: string) => void;
	selectedComponent: string | undefined;
	selectedComponentsList: string[];
	setSelectedComponentOriginal: React.Dispatch<React.SetStateAction<string>>;
	setSelectedComponentsListOriginal: React.Dispatch<React.SetStateAction<string[]>>;
	isRegex: boolean;
	setIsRegex: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DnDEditorSearchInput({
	filter,
	setFilter,
	filterHandle,
	setFilterHandle,
	applyFilter,
	expandAll,
	setExpandAll,
	setOpenParents,
	showOptions,
	setShowOptions,
	selectedOption,
	setSelectedOption,
	searchOptions,
	filteredComponentList,
	onSelectedComponentListChanged,
	selectedComponent,
	selectedComponentsList,
	setSelectedComponentOriginal,
	setSelectedComponentsListOriginal,
	isRegex,
	setIsRegex,
}: DnDEditorSearchInputProp) {
	const handleSelect = (option: string) => {
		setSelectedOption(option);
		setShowOptions(false);
	};

	return (
		<div className="_filterBarContainer">
			<div className="_filterBar">
				<div className="_selectionContainer">
					<div
						className="_selectedOptionBtn"
						onClick={() => setShowOptions(!showOptions)}
					>
						<div className="_selectedOption">{selectedOption}</div>
						<i className="fa-solid fa-caret-down"></i>
					</div>
					{showOptions && (
						<div className="_dropdownOptions">
							{searchOptions.map((searchOption, index) => (
								<div
									key={index}
									className="_dropdownOption"
									style={{
										color:
											selectedOption == searchOption
												? '#4C7FEE'
												: 'rgba(0,0,0,0.7)',
										fontWeight: selectedOption == searchOption ? '600' : '400',
									}}
									onClick={() => handleSelect(searchOption)}
								>
									{searchOption}
								</div>
							))}
						</div>
					)}
				</div>
				<input
					type="text"
					placeholder="Search filter"
					value={filter}
					onChange={e => {
						setFilter(e.target.value);
						if (filterHandle) clearTimeout(filterHandle);
						setFilterHandle(setTimeout(() => applyFilter(e.target.value), 1000));
					}}
				/>
				<div
					className={`_regexIconContainer ${isRegex && '_regexSelected'}`}
					onClick={() => {
						setIsRegex(!isRegex);
						setFilter('');
					}}
				>
					<i className="fa-solid fa-star-of-life"></i>
					<i className="fa-solid fa-square-full"></i>
				</div>
			</div>
			<>
				<i
					title="Select All Filtered Components"
					className="fa fa-solid fa-square-check"
					onClick={() => {
						if (filteredComponentList && filteredComponentList?.length > 0) {
							let filteredList = filteredComponentList.map(filteredComponentKey => {
								return filteredComponentKey;
							});
							setSelectedComponentOriginal('');
							setSelectedComponentsListOriginal([...filteredList]);
						}
					}}
				></i>
				{/* <i
					title="Deselect All Selected Components"
					className="fa-solid fa-xmark"
					onClick={() => {
						// on click of second time desecting previous selected
						if (selectedComponentsList?.length > 0 || selectedComponent) {
							console.log('if');
							setSelectedComponentOriginal('');
							setSelectedComponentsListOriginal([]);
						}
					}}
				></i> */}
			</>
			<i
				className={`fa fa-solid ${expandAll ? 'fa-circle-minus' : 'fa-circle-plus'}`}
				onClick={() => {
					setExpandAll(!expandAll);
					setOpenParents(new Set());
				}}
			></i>
		</div>
	);
}

import React from 'react';
import duplicate from '../../../util/duplicate';
import { setData } from '../../../context/StoreContext';

interface MenuProps {
	menu: any;
	showMenu: React.Dispatch<any>;
	isReadonly: boolean;
	rawDef: any;
	bindingPathPath: string | undefined;
	pageName: string;
	setShowAddSearch: (position: { left: number; top: number }) => void;
}

export default function Menu({
	menu,
	showMenu,
	isReadonly,
	rawDef,
	bindingPathPath,
	pageName,
	setShowAddSearch,
}: MenuProps) {
	if (!menu) return <></>;
	return (
		<div
			className="_menu"
			style={{
				left: `${menu.position.left - 5}px`,
				top: `${menu.position.top - 5}px`,
			}}
			onMouseLeave={() => showMenu(undefined)}
		>
			{menu.type === 'dependent' && (
				<>
					<div
						className="_menuItem"
						onClick={() => {
							if (isReadonly || !bindingPathPath) return;

							const newDef = duplicate(rawDef);
							const statement = newDef.steps[menu.value.statementName];
							if (!statement) return;
							const dependentStatements = statement.dependentStatements;
							if (!dependentStatements) return;
							dependentStatements[menu.value.dependency] = false;
							showMenu(undefined);
							setData(bindingPathPath, newDef, pageName);
						}}
					>
						<i className="fa fa-regular fa-trash-can" /> Remove
					</div>
				</>
			)}
			{menu.type === 'designer' && (
				<>
					<div
						className="_menuItem"
						onClick={() => {
							if (isReadonly || !bindingPathPath) return;
							setShowAddSearch({
								left: menu.position.left - 5,
								top: menu.position.top - 5,
							});
						}}
					>
						<i className="fa fa-regular fa-square-plus" /> Add a Step
					</div>
				</>
			)}
		</div>
	);
}

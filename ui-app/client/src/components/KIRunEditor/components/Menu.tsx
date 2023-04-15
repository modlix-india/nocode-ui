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
}

export default function Menu({
	menu,
	showMenu,
	isReadonly,
	rawDef,
	bindingPathPath,
	pageName,
}: MenuProps) {
	if (!menu) return <></>;
	return (
		<div
			className="_menu"
			style={{
				left: `${menu.position.x - 5}px`,
				top: `${menu.position.y - 5}px`,
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
		</div>
	);
}

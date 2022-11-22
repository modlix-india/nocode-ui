import { dotPathBuilder } from '../../context/StoreContext';

interface Location {
	type: 'EXPRESSION' | 'VALUE';
	value?: string;
	expression?: string;
}

export const updateLocationForChild = (
	location: Location | string,
	index: number,
	locationHistory: Array<Location | string>,
) => {
	let finalPath;
	const typeOfLoc = typeof location;
	if (typeOfLoc === 'string') {
		finalPath = dotPathBuilder(
			location as unknown as string,
			locationHistory,
		);
		return `(${finalPath ? finalPath : location})[${index}]`;
	}
	if (typeOfLoc !== 'object') return undefined;
	let childLocation = { ...(location as Location) };
	if (childLocation?.type === 'VALUE')
		finalPath = locationHistory.length
			? dotPathBuilder(childLocation.value!, locationHistory)
			: '';
	childLocation.value = `(${
		finalPath ? finalPath : childLocation?.value
	})[${index}]`;
	if (childLocation?.type === 'EXPRESSION') {
		finalPath = locationHistory.length
			? dotPathBuilder(childLocation.value!, locationHistory)
			: '';
		childLocation.expression = `(${
			finalPath ? finalPath : childLocation?.expression
		})[${index}]`;
	}
	return childLocation;
};

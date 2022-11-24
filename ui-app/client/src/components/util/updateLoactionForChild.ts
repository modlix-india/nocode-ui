import { dotPathBuilder } from '../../context/StoreContext';
import { DataLocation } from '../types';

export const updateLocationForChild = (
	location: DataLocation | string,
	index: number,
	locationHistory: Array<DataLocation | string>,
): DataLocation | string => {
	let finalPath;
	const typeOfLoc = typeof location;
	if (typeOfLoc === 'string') {
		finalPath = dotPathBuilder(location as unknown as string, locationHistory);
		return `(${finalPath ? finalPath : location})[${index}]`;
	}
	let childLocation = { ...(location as DataLocation) };
	if (childLocation?.type === 'VALUE') {
		finalPath = locationHistory.length
			? dotPathBuilder(childLocation.value!, locationHistory)
			: '';
		childLocation.value = `${finalPath ? finalPath : childLocation?.value}[${index}]`;
	} else if (childLocation?.type === 'EXPRESSION') {
		finalPath = locationHistory.length
			? dotPathBuilder(childLocation.value!, locationHistory)
			: '';
		childLocation.expression = `(${
			finalPath ? finalPath : childLocation?.expression
		})[${index}]`;
	}
	return childLocation;
};

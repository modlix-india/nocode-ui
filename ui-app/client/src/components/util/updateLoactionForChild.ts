import { TokenValueExtractor } from '@fincity/kirun-js';
import { dotPathBuilder } from '../../context/StoreContext';
import { DataLocation, LocationHistory } from '../../types/common';

export const updateLocationForChild = (
	location: DataLocation | string,
	index: number,
	locationHistory: Array<LocationHistory>,
	pageName: string,
	...tve: Array<TokenValueExtractor>
): LocationHistory => {
	let finalPath;
	const typeOfLoc = typeof location;
	if (typeOfLoc === 'string') {
		finalPath = dotPathBuilder(location as unknown as string, locationHistory, ...tve);
		return { location: `(${finalPath ? finalPath : location})[${index}]`, index, pageName };
	}
	let childLocation = { ...(location as DataLocation) };
	if (childLocation?.type === 'VALUE') {
		finalPath = locationHistory.length
			? dotPathBuilder(childLocation.value!, locationHistory, ...tve)
			: '';
		childLocation.value = `${finalPath ? finalPath : childLocation?.value}[${index}]`;
	} else if (childLocation?.type === 'EXPRESSION') {
		finalPath = locationHistory.length
			? dotPathBuilder(childLocation.value!, locationHistory, ...tve)
			: '';
		childLocation.expression = `(${
			finalPath ? finalPath : childLocation?.expression
		})[${index}]`;
	}
	return { location: childLocation, index, pageName };
};

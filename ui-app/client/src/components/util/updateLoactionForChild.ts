import { TokenValueExtractor } from '@fincity/kirun-js';
import { PageStoreExtractor, getPathFromLocation } from '../../context/StoreContext';
import { DataLocation, LocationHistory } from '../../types/common';

export const updateLocationForChild = (
	location: DataLocation | string,
	index: number | string,
	locationHistory: Array<LocationHistory>,
	pageName: string,
	...tve: Array<TokenValueExtractor>
): LocationHistory => {
	let finalPath;
	const typeOfLoc = typeof location;
	const indexPart = typeof index === 'string' ? `.${index}` : `[${index}]`;
	if (typeOfLoc === 'string') {
		finalPath = location as unknown as string;
		return { location: `(${finalPath ? finalPath : location})${indexPart}`, index, pageName };
	}
	let childLocation = { ...(location as DataLocation) };
	if (childLocation?.type === 'VALUE') {
		finalPath = locationHistory.length ? childLocation.value! : '';
		childLocation.value = `${finalPath ? finalPath : childLocation?.value}${indexPart}`;
	} else if (childLocation?.type === 'EXPRESSION') {
		finalPath =
			locationHistory.length && childLocation.expression
				? getPathFromLocation(
						childLocation,
						locationHistory,
						PageStoreExtractor.getForContext(pageName),
				  )
				: '';
		childLocation.expression = `(${
			finalPath ? finalPath : childLocation?.expression
		})${indexPart}`;
	}

	return { location: childLocation, index, pageName };
};

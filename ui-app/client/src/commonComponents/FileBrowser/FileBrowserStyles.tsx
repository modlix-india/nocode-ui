import React, { useEffect, useState } from 'react';
import { StyleResolutionDefinition } from '../../util/styleProcessor';
import { StyleResolution } from '../../types/common';
import { usedComponents } from '../../App/usedComponents';
import { lazyCSSURL } from '../../components/util/lazyStylePropertyUtil';

const NAME = 'FileBrowser';
export function FileBrowserStyles() {
	const TABLET_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.TABLET_POTRAIT_SCREEN,
	)?.minWidth;

	const [used, setUsed] = useState(false);

	useEffect(() => {
		const fn = () => setUsed(true);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setUsed]);

	const styles = `
    @media screen and (max-width: ${TABLET_MIN_WIDTH}px) {
        ._fileBrowser {
            min-width: auto;
            min-height: 400px;
        }

        ._fileBrowser ._searchUploadContainer {
            height: auto;
            flex-wrap: wrap;
        }
    }`;

	return (
		<>
			{used ? <link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} /> : undefined}
			<style id="fileBrowserStyles">{styles}</style>
		</>
	);
}

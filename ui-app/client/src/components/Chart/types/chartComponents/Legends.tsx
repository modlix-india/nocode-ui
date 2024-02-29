import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { ChartData, ChartProperties, Dimension } from '../common';
import { shortUUID } from '../../../../util/shortUUID';

const RECT_WIDTH = 20;
const RECT_HEIGHT = 10;
const SPACE = 10;

interface LegendItem {
	label: string;
	textDimension: Dimension;
	dimension: Dimension;
	color: string;
	fillOpacity: number;
	strokeOpacity: number;
	id?: string;
}

export default function Legends({
	chartDimension,
	legendDimension,
	properties,
	chartData,
	onLegendDimensionChange,
	styles,
}: Readonly<{
	chartDimension: Dimension;
	legendDimension: Dimension;
	properties: ChartProperties;
	chartData: ChartData | undefined;
	onLegendDimensionChange: (d: Dimension) => void;
	styles: CSSProperties;
}>) {
	const labelWidthRef = useRef<SVGTextElement>(null);

	const [legends, setLegends] = useState<LegendItem[]>([]);

	useEffect(() => {
		if (
			properties.legendPosition === 'none' ||
			chartDimension.width <= 0 ||
			chartDimension.height <= 0
		) {
			if (legendDimension.width !== 0 || legendDimension.height !== 0)
				onLegendDimensionChange({ width: 0, height: 0 });
			return;
		}

		if (!labelWidthRef?.current) return;

		const labelGroups: Array<LegendItem> = [];

		for (let i = 0; i < (chartData?.yAxisData?.length ?? 0); i++) {
			const label = properties?.dataSetLabels?.[i] ?? `Data set ${i}`;
			labelWidthRef.current.innerHTML = label;
			const { width, height } = labelWidthRef.current.getBoundingClientRect();
			const textDimension = { width, height };

			labelGroups.push({
				label,
				textDimension,
				dimension: { width: width + RECT_WIDTH + SPACE, height: height },
				color: chartData?.dataColors?.[i]?.safeGet(0) ?? 'black',
				fillOpacity: chartData?.fillOpacity?.[i]?.safeGet(0) ?? 1,
				strokeOpacity: chartData?.strokeOpacity?.[i]?.safeGet(0) ?? 1,
			});
		}

		for (let i = 0; i < labelGroups.length; i++) {}

		setLegends(old => {
			for (let i = 0; i < labelGroups.length; i++) {
				const hasOldObj = !!old[i];
				labelGroups[i].id = hasOldObj ? old[i].id : shortUUID();
				if (!labelGroups[i].dimension.from) labelGroups[i].dimension.from = { x: 0, y: 0 };
				if (hasOldObj) {
					labelGroups[i].dimension.from!.x = old[i].dimension.x ?? 0;
					labelGroups[i].dimension.from!.y = old[i].dimension.y ?? 0;
				}
			}
			return labelGroups;
		});
	}, [
		labelWidthRef?.current,
		chartDimension,
		chartData,
		properties.legendPosition,
		properties.disableLegendInteraction,
		styles,
		setLegends,
	]);

	if (chartDimension.width <= 0 || chartDimension.height <= 0) return <></>;

	return (
		<g>
			<text
				x={0}
				y={0}
				style={{ ...styles, transition: 'none' }}
				fillOpacity={0}
				strokeOpacity={0}
				ref={labelWidthRef}
			></text>
		</g>
	);
}

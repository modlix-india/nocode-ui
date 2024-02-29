import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { ChartData, ChartProperties, Dimension } from '../common';

const RECT_WIDTH = 20;
const RECT_HEIGHT = 10;

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

	const [labels, setLabels] = useState<string[]>([]);
	const [labelDimensions, setLabelDimensions] = useState<Dimension[]>([]);

	useEffect(() => {
		if (properties.legendPosition === 'none') {
			if (legendDimension.width !== 0 || legendDimension.height !== 0)
				onLegendDimensionChange({ width: 0, height: 0 });
			return;
		}

		if (!labelWidthRef?.current) return;

		const dataSetLabels = [];
		const dataSetLabelDimensions: Dimension[] = [];

		for (let i = 0; i < (chartData?.yAxisData?.length ?? 0); i++) {
			dataSetLabels.push(properties?.dataSetLabels?.[i] ?? `Data set ${i}`);
			labelWidthRef.current.innerHTML = dataSetLabels[i];
			const { width, height } = labelWidthRef.current.getBoundingClientRect();
			dataSetLabelDimensions.push({ width, height });
		}

		setLabels(dataSetLabels);
		setLabelDimensions(dataSetLabelDimensions);
	}, [
		labelWidthRef?.current,
		chartDimension,
		chartData,
		properties.legendPosition,
		properties.disableLegendInteraction,
		styles,
	]);

	console.log(labels, labelDimensions);

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

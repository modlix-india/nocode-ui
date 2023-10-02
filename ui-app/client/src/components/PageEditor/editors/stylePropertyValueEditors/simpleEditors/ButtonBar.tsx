import React, { CSSProperties, useMemo, useRef, useState } from 'react';
import { SimpleEditorMultipleValueType } from '.';
import { isNullValue } from '@fincity/kirun-js';

export type ButtonBarOptions = Array<{ name: string; displayName: string; description?: string }>;

export function ButtonBar({
	value,
	onChange,
	options: orignalOptions,
}: {
	value: string;
	onChange: (v: string | Array<string>) => void;
	options: ButtonBarOptions;
}) {
	return <div tabIndex={0} className="_simpleEditorButtonBar" role="menubar"></div>;
}

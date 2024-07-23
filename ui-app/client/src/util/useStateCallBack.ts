import React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useStateCallback<T>(
	initialState: T,
): [T, (state: T | ((v: T) => T), cb?: (state: T) => void) => void] {
	const [state, setState] = useState(initialState);
	const cbRef = useRef<((state: T) => void) | undefined>(undefined); // init mutable ref container for callbacks

	const setStateCallback = useCallback((state: T | ((v: T) => T), cb?: (state: T) => void) => {
		if (!cbRef.current) cbRef.current = cb;
		setState(state);
	}, []);

	useEffect(() => {
		if (cbRef.current) {
			cbRef.current(state);
			cbRef.current = undefined;
		}
	}, [state]);

	return [state, setStateCallback];
}

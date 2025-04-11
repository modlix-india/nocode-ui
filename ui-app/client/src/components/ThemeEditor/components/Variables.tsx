import React from 'react';
import { StyleResolution } from '../../../types/common';

export default function Variables({ theme, device, themeGroup, component, onThemeChange }:
    Readonly<{
        theme: any; device: string; themeGroup: StyleResolution; component: string;
        onThemeChange: (theme: any) => void
    }>) {
    return <div className="_variables"></div>;
}

import { StylePropertyDefinition, StyleResolution } from '../../../types/common';
import { styleProperties as appStyleProperties } from '../../../App/appStyleProperties';
import ComponentDefinitions from '../../index';
import { useEffect, useState } from 'react';

export interface VariableEditProps {
    themeGroup: StyleResolution;
    variableName: string;
    value: string;
}

export function Variables({ theme, themeGroup, component, onThemeChange }:
    Readonly<{
        theme: any; themeGroup: StyleResolution; component: string;
        onThemeChange: (changedProps: Array<VariableEditProps>) => void
    }>) {

    const [search, setSearch] = useState('');
    const [groupsStatus, setGroupStatus] = useState<Record<string, boolean>>({});
    const [defaultOpen, setDefaultOpen] = useState(true);

    useEffect(() => setGroupStatus({}), [component]);

    const stylePropGroups = Array.from(Object.entries((component === "_app" ?
        appStyleProperties :
        ComponentDefinitions.get(component)!.stylePropertiesForTheme)
        .reduce((groups, prop) => {
            const group = prop.gn ?? 'Default';
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(prop);
            return groups;
        }, {} as Record<string, StylePropertyDefinition[]>)))
        .map(([group, props]) => (
            <VariableGroup key={group} search={search} groupName={group}
                theme={theme} themeGroup={themeGroup} component={component}
                onThemeChange={onThemeChange} props={props}
                isGroupOpen={defaultOpen ? !groupsStatus[group] : groupsStatus[group]}
                onToggleGroup={() => setGroupStatus({ ...groupsStatus, [group]: !groupsStatus[group] })} />
        ));

    return <div className="_variables">
        <div className="_filterContainer">
            <div className="_searchBar">
                <input type="text" placeholder="Filter" value={search} onChange={e => setSearch(e.target.value)} />
                <button className="_smallButton" onClick={() => {
                    setDefaultOpen(true);
                    setGroupStatus({});
                }}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M6 12H18M12 6V18" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
                <button className="_smallButton" onClick={() => {
                    setDefaultOpen(false);
                    setGroupStatus({});
                }}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M6 12H18" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
        <div className="_variableGroups">
            {stylePropGroups}
        </div>
    </div>;
}

function VariableGroup({ search, groupName, theme, themeGroup, component, onThemeChange, props, isGroupOpen, onToggleGroup }:
    Readonly<{
        search: string; groupName: string; theme: any; themeGroup: StyleResolution; component: string;
        onThemeChange: (changedProps: Array<VariableEditProps>) => void
        props: StylePropertyDefinition[]
        isGroupOpen: boolean;
        onToggleGroup: () => void;
    }>) {

    let variables;

    if (isGroupOpen) {
        variables = props.filter(prop => !search || prop.dn.toLowerCase().includes(search.toLowerCase())).map(prop => <VariableEdit key={prop.n}
            theme={theme} themeGroup={themeGroup} component={component} onThemeChange={onThemeChange} prop={prop} />);
    }

    const caret = <svg className={`_caret ${isGroupOpen ? '_open' : '_closed'}`} viewBox="0 0 256 256" >
        <path d="M96,212a4,4,0,0,1-2.82861-6.82837L170.34326,128,93.17139,50.82837a4.00009,4.00009,0,0,1,5.65722-5.65674l80,80a4,4,0,0,1,0,5.65674l-80,80A3.98805,3.98805,0,0,1,96,212Z" />
    </svg>

    return <div className="_variableGroup">
        <div className="_title" onClick={onToggleGroup}>
            {caret}
            {groupName}
        </div>
        {variables}
    </div>;
}

function VariableEdit({ theme, themeGroup, component, onThemeChange, prop }:
    Readonly<{
        theme: any; themeGroup: StyleResolution; component: string;
        onThemeChange: (changedProps: Array<VariableEditProps>) => void
        prop: StylePropertyDefinition
    }>) {

    const defaultValue = theme?.variables?.[themeGroup]?.[prop.n] ?? theme?.variables?.ALL?.[prop.n] ?? prop.dv ?? '';
    const [value, setValue] = useState<string>();

    useEffect(() => {
        setValue(theme?.variables?.[themeGroup]?.[prop.n] ?? theme?.variables?.ALL?.[prop.n] ?? prop.dv ?? '');
    }, [theme, themeGroup, prop.n, theme?.variables?.[themeGroup]?.[prop.n] ?? theme?.variables?.ALL?.[prop.n] ?? prop.dv]);

    return <div className="_variable">
        <div className="_variableName" title={prop.de}>
            {prop.dn}:
        </div>
        <input type="text" value={value}
            onChange={v => setValue(v.target.value)}
            onBlur={(e) => {
                if (e.target.value === '') setValue(defaultValue)
                if (e.target.value === defaultValue) return;

                onThemeChange([{ themeGroup, variableName: prop.n, value: e.target.value }]);
            }} />
    </div>;
}

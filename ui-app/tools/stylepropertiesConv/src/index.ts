const props = require('../../../../ui-app/client/dist/styleProperties/TextBox_old.json');

const enums =[
    [ "designType", ["_default", "_outlined", "_filled", "_bigDesign1"]],
    [ "colorScheme", ["_primary", "_secondary", "_tertiary", "_quaternary", "_quinary"]] 
];

const namePrefix = 'textBox';

const processed: Map<string, {gn?: string, n?: string, cp: string, sel: string, dv?: string, np: boolean, spv?: {[_: string]: string}, dn?: string}> = new Map();

const nonsel: any[] = [];

for (const prop of props) {

    if (!prop.sel || !prop.cp) {nonsel.push(prop); continue;}

    let key = prop.sel.trim();
    const vals = [];

    for (const [enumCat, values] of enums) {
        let foundVal = '';

        for (const enumVal of values) {
            if (key.includes('.'+enumVal)) {
                foundVal = enumVal;
                key = key.replaceAll('.'+enumVal, `<${enumCat}>`);
                break;
            }
        }

        if (foundVal)
        vals.push(foundVal);
    }

    let obj = processed.get( `${prop.cp}-${key}`);

    if (obj === undefined) {
        obj = {cp : prop.cp, sel: key, np: true, spv: {}};
        processed.set( `${prop.cp}-${key}`, obj);
    }

    obj.spv![vals.join('-')] = prop.dv;
}

const bigName = (str: string | undefined) => {
    if (!str) return undefined;
    return str.split("-").map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(' ');
};

const variableName = (str: string | undefined) => {
    if (!str) return undefined;
    return namePrefix + str.replace(/ /g, '');
};

const pArray = Array.from(processed.values()).map(e => {
    e.gn = bigName(e.cp);
    e.dn = e.gn;
    e.n = variableName(e.gn);
    return e;
});

const uniqueCombos =  enums.reduce((acc, [_, values]) => acc * values.length , 1);

for (const prop of pArray) {

    const spvValues = Object.entries(prop.spv!).filter(([_, val]) => val !== undefined);

    if (spvValues.length === 0 && prop.spv) delete prop['spv'];
    
    if (spvValues.length !== uniqueCombos) continue;

    const groupValues = spvValues.reduce((acc, [key, val]) => {
        if (!val) return acc;
        if (!acc[val]) acc[val]=[];
        acc[val].push(key);
        return acc;
    }, {} as {[key: string]: string[]});

    const keySet = Object.entries(groupValues).sort((a,b) => b[1].length - a[1].length)?.[0];

    if ((keySet?.[1].length ?? 0) < 3) continue;
    
    keySet[1].forEach(each => delete prop.spv![each]);
    prop.dv = keySet[0];
}

pArray.sort((a, b) => a.sel.localeCompare(b.sel));

console.log(JSON.stringify(pArray, null, 2));
console.log(`Total : ${pArray.length}`)

console.log("Non-selected", nonsel);

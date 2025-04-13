function validate(props: any) {
 
    const common: {[key: string]: string} = {};

    let hasDuplicates = false;

    for (const prop of props) {
        if (!prop.sel || !prop.cp) continue;
        const key = prop.n.trim().split('').sort().join('');
        
        if (common[`${prop.cp}-${key}`]) {
            console.log(`${prop.cp}-${key}`,common[`${prop.cp}-${key}`], ' => ', prop.cp, prop.sel);
            hasDuplicates = true;
            continue;
        }

        common[`${prop.cp}-${key}`] = prop.n;
    }

    // console.log(common);

    if (hasDuplicates) {
        console.log('Duplicates found');
    } else {
        console.log('No duplicates found');
    }
}

validate(require('../../../../ui-app/client/dist/styleProperties/TextBox.json'));


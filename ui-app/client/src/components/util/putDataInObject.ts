export function putDataInObject(object: any, data: any, path: string) {

    let current = object;
    const parts = path?.match(/\[.*?\]|\.[^.[\]]+|\w+/g) ?? [];
    
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        
        if (part.startsWith('.')) {
            part = part.substring(1);
        }
        
        if (part.startsWith('[')) {
            part = part.slice(1, -1);
            if (part.startsWith('"') || part.startsWith("'")) {
                part = part.slice(1, -1);
            }
        }

        if (i === parts.length - 1) {
            current[part] = data;
        } else {
            if (current[part] === undefined) {
                const nextPart = parts[i + 1];
                if (nextPart && nextPart.startsWith('[')) {
                    const bracketContent = nextPart.slice(1, -1);
                    const isQuotedString = (bracketContent.startsWith('"') && bracketContent.endsWith('"')) || 
                                         (bracketContent.startsWith("'") && bracketContent.endsWith("'"));
                    const isNumeric = /^\d+$/.test(bracketContent);
                    
                    if (isQuotedString || !isNumeric) {
                        current[part] = {};
                    } else {
                        current[part] = [];
                    }
                } else {
                    current[part] = {};
                }
            }
            current = current[part];
        }
    }
}
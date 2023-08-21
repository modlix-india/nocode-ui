// import React from "react";
// import { SchemaType } from "@fincity/kirun-js";
// import { StringValueEditor } from './StringValueEditor';
// import { BooleanValueEditor } from './BooleanValueEditor';
// import { NumberValueEditor } from './NumberValueEditor';

// export default function MultiSchema (types:any, currentType:any, value:any, schema:any, path:any, schemaRepository:any) {

//     return(
//         (types?.size)
//             if (currentType === SchemaType.OBJECT) {
//                 return <div className="_singleSchema"></div>;
//             } else if (currentType === SchemaType.ARRAY) {
//                 return <div className="_singleSchema"></div>;
//             } else if (currentType === SchemaType.STRING) {
//                 return (
//                     <div>
//                         <StringValueEditor
//                             value={value}
//                             schema={schema}
//                             onChange={v => onChange(path, v)}
//                             schemaRepository={schemaRepository}
//                         />
//                         {types?.size > 1 ? dropdown : ''}
//                     </div>
//                 );
//             } else if (currentType === SchemaType.BOOLEAN) {
//                 return (
//                     <div>
//                         <BooleanValueEditor
//                             value={value}
//                             schema={schema}
//                             onChange={v => onChange(path, v)}
//                             schemaRepository={schemaRepository}
//                         />
//                         {types?.size > 1 ? dropdown : ''}
//                     </div>
//                 );
//             } else if (isSubset(types, NUMBER_SET)) {
//                 return (
//                     <div>
//                         <NumberValueEditor
//                             value={value}
//                             schema={schema}
//                             onChange={v => onChange(path, v)}
//                             schemaRepository={schemaRepository}
//                         />
//                         {types?.size > 1 ? dropdown : ''}
//                     </div>
//                 );
//             }
//         } else if (isSubset(types, NUMBER_SET)) {
//             return (
//                 <NumberValueEditor
//                     value={value}
//                     schema={schema}
//                     onChange={v => onChange(path, v)}
//                     schemaRepository={schemaRepository}
//                 />
//             );
//         }
//     )

// }

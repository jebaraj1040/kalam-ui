import buildSchemaMap from './buildSchemaMap';
import { toSnakeCase } from './CaseConverter';

export default function transformData(data: any, schemaMap: Record<string, any>): any {
    const result: Record<string, any> = {};

    // console.log(' Starting transformData');
    // console.log('Initial schemaMap:', schemaMap);
    // console.log('Input data:', data);

    for (const [rawKey, rawValue] of Object.entries(data)) {
        // console.log('\n Processing key:', rawKey);

        const schema = schemaMap[rawKey];

        if (!schema) {
            // console.warn('No direct match found in schemaMap for:', rawKey);

            // Fallback: try nested child
            const parent = Object.values(schemaMap).find((s: any) => s?.children?.some((child: any) => child.id === rawKey));

            if (parent) {
                const child = parent.children.find((c: any) => c.id === rawKey);
                const childKey = toSnakeCase(child.title);

                // console.log('Fallback matched child section:', rawKey, '→', childKey);

                result[childKey] = Array.isArray(rawValue)
                    ? rawValue.map((item: any) => (child.children?.length ? transformData(item, buildSchemaMap(child.children)) : item))
                    : rawValue;
                continue;
            }

            // console.warn('No mapping found even in fallback. Keeping key as is:', rawKey);
            result[rawKey] = rawValue;
            continue;
        }

        const sectionKey = toSnakeCase(schema.title);
        const isRepeatable = schema.repeatable;
        const childrenMap = buildSchemaMap(schema.children || []);

        // console.log('Mapped key:', rawKey, '→', sectionKey);
        // console.log('Is repeatable?', isRepeatable);

        if (Array.isArray(rawValue)) {
            result[sectionKey] = rawValue.map((entry: any) => {
                const newEntry: Record<string, any> = {};

                for (const [entryKey, entryValue] of Object.entries(entry)) {
                    if (entryKey === '_uid') {
                        // newEntry['_uid'] = entryValue;
                        continue;
                    }

                    const fieldSchema = childrenMap[entryKey];
                    if (fieldSchema) {
                        const nestedKey = toSnakeCase(fieldSchema.title);

                        // console.log('Child key:', entryKey, '→', nestedKey);

                        if (Array.isArray(entryValue)) {
                            newEntry[nestedKey] = entryValue.map((item: any) => {
                                const cleanedItem: any = { ...item };
                                delete cleanedItem._uid;

                                return fieldSchema.children?.length ? transformData(cleanedItem, buildSchemaMap(fieldSchema.children)) : cleanedItem;
                            });
                        } else if (typeof entryValue === 'object' && entryValue !== null) {
                            const cleaned: any = { ...entryValue };
                            delete cleaned._uid;

                            newEntry[nestedKey] = fieldSchema.children?.length
                                ? transformData(cleaned, buildSchemaMap(fieldSchema.children))
                                : cleaned;
                        } else {
                            newEntry[nestedKey] = entryValue;
                        }
                    } else {
                        // console.warn('No fieldSchema found for entryKey:', entryKey);
                        newEntry[entryKey] = entryValue;
                    }
                }

                return newEntry;
            });
        } else if (typeof rawValue === 'object' && rawValue !== null) {
            result[sectionKey] = transformData(rawValue, childrenMap);
        } else {
            result[sectionKey] = isRepeatable ? [rawValue] : rawValue;
        }
    }

    // console.log('Final transformed result:', result);
    return result;
}

export default function buildSchemaMap(schemaArray: any[]): Record<string, any> {
    let map: Record<string, any> = {};

    for (const section of schemaArray) {
        map[section.id] = {
            title: section.title,
            repeatable: section.repeatable || false,
            children: section.children || [],
        };

        if (section.children?.length) {
            map = { ...map, ...buildSchemaMap(section.children) };
        }
    }

    return map;
}

export function toKebabCase(str: string): string {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Add dash between camelCase letters
        .replace(/[\s_]+/g, '-') // Replace spaces or underscores with dash
        .toLowerCase();
}

export function toSnakeCase(str: string): string {
    return str
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^\w]/g, '') // Remove non-word characters (optional)
        .toLowerCase();
}

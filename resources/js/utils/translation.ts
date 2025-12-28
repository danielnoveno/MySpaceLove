export const replacePlaceholders = (
    template: string,
    replacements: Record<string, string | number>,
): string => {
    return Object.entries(replacements).reduce((result, [placeholder, value]) => {
        return result.replace(new RegExp(`:${placeholder}`, "g"), String(value));
    }, template);
};

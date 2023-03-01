import path from "path";

export const buildContentFilePath = (filename: string): string => {
    return path.join(process.env.CONTENT_FOLDER || 'data', filename)
}

export const isValidFilename = (filename: string): boolean => {
    return RegExp('^[0-9a-zA-Z-._/]+$').test(filename);
}
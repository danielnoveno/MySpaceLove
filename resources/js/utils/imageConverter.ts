const SMALL_FILE_THRESHOLD = 2 * 1024 * 1024; // 2MB -> skip conversion to keep things snappy
const MAX_DIMENSION = 1920; // resize large photos to keep upload size reasonable
const TARGET_QUALITY = 0.72;

const readImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to load image for conversion."));
        };

        img.src = objectUrl;
    });
};

const blobToFile = (blob: Blob, originalName: string): File => {
    const webpFileName = originalName.split(".").slice(0, -1).join(".") + ".webp";
    return new File([blob], webpFileName, {
        type: "image/webp",
        lastModified: Date.now(),
    });
};

export const convertImageToWebP = async (file: File): Promise<File> => {
    if (!file.type.startsWith("image/")) {
        throw new Error("File is not an image.");
    }

    // Fast path: small files are uploaded as-is (skip conversion).
    if (file.size <= SMALL_FILE_THRESHOLD) {
        return file;
    }

    const img = await readImage(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const targetWidth = Math.max(1, Math.round(img.width * scale));
    const targetHeight = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Could not get canvas context.");
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob: Blob | null = await new Promise((resolve) => {
        canvas.toBlob(
            (b) => resolve(b),
            "image/webp",
            TARGET_QUALITY,
        );
    });

    if (!blob) {
        // Fall back to original if conversion fails.
        return file;
    }

    const converted = blobToFile(blob, file.name);

    // Use the smaller of the two (converted vs original) to save time on upload.
    return converted.size < file.size ? converted : file;
};

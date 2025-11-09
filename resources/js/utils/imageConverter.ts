export const convertImageToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("File is not an image."));
            return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Could not get canvas context."));
                return;
            }
            ctx.drawImage(img, 0, 0, img.width, img.height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const webpFileName = file.name.split(".").slice(0, -1).join(".") + ".webp";
                        const webpFile = new File([blob], webpFileName, {
                            type: "image/webp",
                            lastModified: Date.now(),
                        });
                        resolve(webpFile);
                    } else {
                        reject(new Error("Failed to convert image to WebP."));
                    }
                },
                "image/webp",
                0.8, // Quality from 0 to 1
            );
            URL.revokeObjectURL(img.src);
        };

        img.onerror = (error) => {
            reject(new Error("Failed to load image for conversion."));
            URL.revokeObjectURL(img.src);
        };
    });
};
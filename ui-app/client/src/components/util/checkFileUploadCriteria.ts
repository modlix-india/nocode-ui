function checkResolution(file: File): Promise<{ width: number, height: number } | boolean> {
    return new Promise((resolve, reject) => {
        if (!file) resolve(false);
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const img = new Image();
            img.onload = (e) => onLoadhandler(e);
            img.onerror = () => reject(true);
            img.src = e.target?.result as string;

            function cleanup() {
                img.onload = (e) => onLoadhandler(e);
                if (img.remove) {
                    img.remove();
                }
            }

            const onLoadhandler = (event: any) => {
                try {
                    const img_width = event.target.naturalWidth;
                    const img_height = event.target.naturalHeight;

                    if (img_width >= 350 && img_width <= 32000 && img_height >= 240 && img_height <= 32000) {
                        resolve(true);
                        return;
                    }
                    resolve(false);
                } catch (e) {
                    resolve(false);
                } finally {
                    cleanup();
                }
            };
        };
        reader.onerror = () => reject(true);
        reader.readAsDataURL(file);
    });
}

export async function checkFileUploadCriteria(files: any, validFileTypes: Array<string>, maxSize: number) {
    const imgFile = ["image/jpeg", "image/jpg", "image/png"];
    if (!files) {
        return {
            fileType: {
                errors: true,
            },
            fileSize: {
                errors: true,
            },
            status: {
                value: 'fail',
            }
        }
    }

    const fileObj = files[0];

    const { size, type } = fileObj;

    let fileTypeValidIndex = validFileTypes.findIndex(elem => elem == type), isReolutionRight;

    if (fileTypeValidIndex !== -1) {
        if (size > maxSize) {
            return {
                fileSize: {
                    errors: `File size should be less than or equal to ${maxSize / 1000000}MB`
                },
                status: {
                    value: 'fail',
                }
            }
        }

        if (imgFile?.includes(validFileTypes[fileTypeValidIndex])) {
            isReolutionRight = await checkResolution(files[0]);
        }

        console.log(isReolutionRight);

        if (!isReolutionRight) {
            return {
                fileResolution: {
                    errors: `File width should be > 350px & < 32000px and height should be > 240px and < 32000px`,
                },
                status: {
                    value: 'fail',
                }
            };
        }
        //passed all criteria
        return {
            fileType: {
                errors: false,
            },
            fileResolution: {
                errors: false,
            },
            fileSize: {
                errors: false,
            },
            status: {
                value: 'success',
            }
        };
    }
    return {
        fileType: {
            errors: `File type is not a valid type`,
        },
        status: {
            value: 'fail',
        }
    }
}
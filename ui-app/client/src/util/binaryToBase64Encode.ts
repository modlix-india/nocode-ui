export default function binaryToBase64Encode(file: File, withmetadata: boolean) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event: ProgressEvent<FileReader>) => {
			if (event.target) {
				const binaryData: ArrayBuffer | null = event.target.result as ArrayBuffer;
				if (binaryData) {
					const base64Encoded: string = btoa(
						new Uint8Array(binaryData).reduce(
							(data, byte) => data + String.fromCharCode(byte),
							'',
						),
					);
					if (!withmetadata) resolve(base64Encoded);
					else
						resolve(
							'data:' + file.type + ';name:' + file.name + ';base64,' + base64Encoded,
						);
				} else {
					reject(new Error('Failed to read binary data from the file.'));
				}
			}
		};

		reader.onerror = () => {
			reject(new Error('Error reading the file.'));
		};
		reader.readAsArrayBuffer(file);
	});
}

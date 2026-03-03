export async function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => resolve(e.target?.result as string);
		reader.onerror = (e) =>
			reject(new Error(`File read failed: ${(e.target as FileReader).error?.message}`));
		reader.readAsText(file);
	});
}

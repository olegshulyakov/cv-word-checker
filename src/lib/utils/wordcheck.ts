export interface WeakWordFinding {
	originalPhrase: string;
	suggestions: string[];
	startIndex: number;
	endIndex: number;
}

export function findWeakWords(
	cvText: string,
	weakWordsDict: Record<string, string[]>
): WeakWordFinding[] {
	if (!cvText) return [];

	const findings: WeakWordFinding[] = [];
	const lowerText = cvText.toLowerCase();

	for (const [weakPhrase, suggestions] of Object.entries(weakWordsDict)) {
		const lowerPhrase = weakPhrase.toLowerCase();
		let startIndex = lowerText.indexOf(lowerPhrase);

		while (startIndex !== -1) {
			// Check if it's a whole word match (not part of another word like 'responsible for' inside 'irresponsible for')
			const beforeChar = startIndex === 0 ? ' ' : lowerText[startIndex - 1];
			const afterChar =
				startIndex + lowerPhrase.length >= lowerText.length
					? ' '
					: lowerText[startIndex + lowerPhrase.length];

			if (/[^a-z0-9]/.test(beforeChar) && /[^a-z0-9]/.test(afterChar)) {
				// We want to capture the original casing from the text
				findings.push({
					originalPhrase: cvText.substring(startIndex, startIndex + lowerPhrase.length),
					suggestions,
					startIndex,
					endIndex: startIndex + lowerPhrase.length
				});
			}

			startIndex = lowerText.indexOf(lowerPhrase, startIndex + 1);
		}
	}

	return findings.sort((a, b) => a.startIndex - b.startIndex);
}

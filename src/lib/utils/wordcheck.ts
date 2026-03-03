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
			// Check if it's a whole word match (not part of another word)
			// For CJK scripts, we skip boundary checks as they don't use spaces
			const isCJK = /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/;
			const isNonWord = /[^\p{L}\p{N}]/u;

			const isBeforeBoundary =
				startIndex === 0 || isCJK.test(lowerPhrase[0]) || isNonWord.test(lowerText[startIndex - 1]);

			const isAfterBoundary =
				startIndex + lowerPhrase.length >= lowerText.length ||
				isCJK.test(lowerPhrase[lowerPhrase.length - 1]) ||
				isNonWord.test(lowerText[startIndex + lowerPhrase.length]);

			if (isBeforeBoundary && isAfterBoundary) {
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

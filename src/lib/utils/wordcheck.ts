export interface WeakWordFinding {
	originalPhrase: string;
	suggestions: string[];
	startIndex: number;
	endIndex: number;
}

function escapeRegExp(string: string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findWeakWords(
	cvText: string,
	weakWordsDict: Record<string, string[]>
): WeakWordFinding[] {
	if (!cvText) return [];

	const findings: WeakWordFinding[] = [];

	for (const [weakPhrase, suggestions] of Object.entries(weakWordsDict)) {
		// Split the weak phrase into constituent words
		const words = weakPhrase.trim().split(/\s+/);

		// Join words with a pattern that matches any sequence of NON-letters and NON-numbers.
		// This neatly bridges across spaces, newlines, tabs, and markdown symbols like **, _, etc. (BUG-20, BUG-21)
		const patternBody = words.map(escapeRegExp).join('[^\\p{L}\\p{N}]+');

		// Boundary check: word must not be immediately preceded or followed by a letter/number
		const regex = new RegExp(`(?<![\\p{L}\\p{N}])${patternBody}(?![\\p{L}\\p{N}])`, 'gui');

		let match;
		while ((match = regex.exec(cvText)) !== null) {
			findings.push({
				originalPhrase: cvText.substring(match.index, match.index + match[0].length),
				suggestions,
				startIndex: match.index,
				endIndex: match.index + match[0].length
			});
		}
	}

	return findings.sort((a, b) => a.startIndex - b.startIndex);
}

import { escapeRegExp } from '../utils/regex';

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

	for (const [weakPhrase, suggestions] of Object.entries(weakWordsDict)) {
		// Split the weak phrase into constituent words
		const words = weakPhrase.trim().split(/\s+/);

		// Join words with a pattern that matches any sequence of NON-letters and NON-numbers, OR HTML tags.
		// This neatly bridges across spaces, newlines, tabs, and markdown symbols like **, _, etc. (BUG-20, BUG-21, BUG-23)
		const patternBody = words.map(escapeRegExp).join('(?:<[^>]*>|[^\\p{L}\\p{N}])+');

		// Check if the phrase contains CJK characters (BUG-24)
		const isCJK = /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(weakPhrase);

		// Boundary check: word must not be immediately preceded or followed by a letter/number
		// For CJK languages that don't use spaces, we drop the strict boundary requirement
		const prefix = isCJK ? '' : '(?<![\\p{L}\\p{N}])';
		const suffix = isCJK ? '' : '(?![\\p{L}\\p{N}])';
		const regex = new RegExp(`${prefix}${patternBody}${suffix}`, 'gui');

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

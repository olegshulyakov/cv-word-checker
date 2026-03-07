import { i18n } from '../i18n.svelte';
import type { KeywordResult } from './analyzer';

function getStems(word: string): string[] {
	if (word.length <= 3) return [word];
	const stems = [word];
	if (word.endsWith('ies')) stems.push(word.slice(0, -3) + 'y');
	if (word.endsWith('es')) stems.push(word.slice(0, -2), word.slice(0, -1));
	if (word.endsWith('s') && !word.endsWith('ss')) stems.push(word.slice(0, -1));
	if (word.endsWith('ing')) {
		const base = word.slice(0, -3);
		stems.push(base, base + 'e', base + 'ement');
		if (base.endsWith('at')) stems.push(base + 'ion');
	}
	if (word.endsWith('ed')) {
		const base = word.slice(0, -2);
		stems.push(base, base + 'e', base + 'ement');
		if (base.endsWith('at')) stems.push(base + 'ion');
	}
	if (word.endsWith('lyst') || word.endsWith('lyzing')) {
		stems.push(word.replace(/(lyst|lyzing)$/, 'lysis'));
	}
	return stems;
}

export function extractKeywords(text: string, stopWords: Set<string>): KeywordResult[] {
	if (!text) return [];

	// BUG-03 & BUG-09: Replace hyphens with spaces to normalize compound words
	// Note: html stripping must be done by the caller before passing to extractKeywords.
	const cleanText = text.toLowerCase().replace(/-/g, ' ');

	// Match words or multi-word terms.
	// BUG-16 & BUG-01: preserve unicode letters, numbers, and core tech punctuation (+ # . \/)
	const rawTokens = cleanText.replace(/[^\p{L}\p{N}\s+#./]/gu, ' ').split(/\s+/);

	const allControlled = new Set<string>();
	if (i18n.dict) {
		[
			...i18n.dict.technicalSkillsKeywords,
			...i18n.dict.abilitiesKeywords,
			...i18n.dict.titleAndDegreeKeywords
		].forEach((k) => allControlled.add(String(k).toLowerCase()));
	}

	const preTokens: string[] = [];
	for (const t of rawTokens) {
		const tLower = t.toLowerCase();
		if (t.includes('/') && !allControlled.has(tLower) && !i18n.dict?.aliases?.[tLower]) {
			preTokens.push(...t.split('/'));
		} else {
			preTokens.push(t);
		}
	}

	const tokens = preTokens
		// BUG-05 & BUG-16: preserve leading dot for '.net', but clean trailing unicode punctuation properly
		.map((t) => t.replace(/^[^\p{L}\p{N}.+#]+|[^\p{L}\p{N}+#]+$/gu, '').toLowerCase())
		.filter((t) => t.length > 1 && (!stopWords.has(t) || t === 'español' || t === 'résumé'));

	const frequency: Record<string, number> = {};
	const aliases = i18n.dict?.aliases || {};

	for (const token of tokens) {
		const matchedCanonicals = new Set<string>();

		// 1. Direct Alias Match
		if (aliases[token]) {
			matchedCanonicals.add(aliases[token]);
		}

		// 2. Direct exact match
		if (allControlled.has(token)) {
			matchedCanonicals.add(token);
		}

		// 3. Fallback to stemming
		const stems = getStems(token);
		for (const stem of stems) {
			if (aliases[stem]) {
				matchedCanonicals.add(aliases[stem]);
			}
			if (allControlled.has(stem)) {
				matchedCanonicals.add(stem);
			}
		}

		// 4. Default: just track the raw word for phrase matching later
		if (matchedCanonicals.size === 0) {
			matchedCanonicals.add(token);
		}

		for (const canonical of matchedCanonicals) {
			frequency[canonical] = (frequency[canonical] || 0) + 1;
		}
	}

	return Object.entries(frequency)
		.map(([term, count]) => ({ term, count }))
		.sort((a, b) => b.count - a.count);
}

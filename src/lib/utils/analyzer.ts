import { stripHtmlAndMarkdown } from './parser';
import { i18n } from '../i18n.svelte';

export interface KeywordResult {
	term: string;
	count: number;
	cvCount?: number;
}

export interface MatchResults {
	matchScore: number;
	presentKeywords: KeywordResult[];
	missingKeywords: KeywordResult[];
	groups: {
		technicalSkills: { present: KeywordResult[]; missing: KeywordResult[] };
		abilities: { present: KeywordResult[]; missing: KeywordResult[] };
		titleAndDegree: { present: KeywordResult[]; missing: KeywordResult[] };
		otherKeywords: { present: KeywordResult[]; missing: KeywordResult[] };
	};
}

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
		stems.push('data analysis');
	}
	return stems;
}

export function extractKeywords(text: string, stopWords: Set<string>): KeywordResult[] {
	if (!text) return [];

	// BUG-03 & BUG-09: Replace hyphens with spaces to normalize compound words
	const cleanText = stripHtmlAndMarkdown(text).toLowerCase().replace(/-/g, ' ');

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

export function matchKeywords(
	cvText: string,
	jdText: string,
	stopWords: Set<string>,
	technicalSkillsKeywords: Set<string>,
	abilitiesKeywords: Set<string>,
	titleAndDegreeKeywords: Set<string>
): MatchResults {
	const cleanCv = stripHtmlAndMarkdown(cvText).toLowerCase().replace(/-/g, ' ');
	const cleanJd = stripHtmlAndMarkdown(jdText).toLowerCase().replace(/-/g, ' ');

	const jdKeywords = extractKeywords(cleanJd, stopWords);
	const cvKeywords = extractKeywords(cleanCv, stopWords);

	const cvTermCounts = new Map(cvKeywords.map((k) => [k.term, k.count]));

	// Gather controlled keywords
	const controlledKeywords = new Set([
		...technicalSkillsKeywords,
		...abilitiesKeywords,
		...titleAndDegreeKeywords
	]);

	// Filter and combine results: standard single-word keywords + detected multi-word keywords
	const finalJdKeywords: KeywordResult[] = [...jdKeywords];
	const aliases = i18n.dict?.aliases || {};

	// Add multi-word aliases scanning to raw text
	// Multi-word aliases (e.g. "amazon web services" -> "aws")
	const multiWordAliases = Object.entries(aliases).filter(([k]) => k.includes(' '));

	// Process phrase keywords for JD
	for (const kw of controlledKeywords) {
		if (kw.includes(' ')) {
			const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const regex = new RegExp(`\\b${escapedKw}\\b`, 'gu');
			let count = (cleanJd.match(regex) || []).length;

			// Check multi-word aliases that map to this keyword
			for (const [aliasPhrase, target] of multiWordAliases) {
				if (target === kw) {
					const escapedAlias = aliasPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					const aliasRegex = new RegExp(`\\b${escapedAlias}\\b`, 'gu');
					count += (cleanJd.match(aliasRegex) || []).length;
				}
			}

			if (count > 0) {
				if (!finalJdKeywords.some((k) => k.term === kw)) {
					finalJdKeywords.push({ term: kw, count });
				} else {
					const existing = finalJdKeywords.find((k) => k.term === kw);
					if (existing) existing.count += count;
				}
				// Subtract counts from individual words to avoid double-counting
				const words = kw.split(' ');
				for (const word of words) {
					const existing = finalJdKeywords.find((k) => k.term === word);
					if (existing) {
						existing.count = Math.max(0, existing.count - count);
					}
				}
			}
		}
	}

	// Process phrase keywords for CV
	const finalCvTermCounts = new Map(cvTermCounts);
	for (const kw of controlledKeywords) {
		if (kw.includes(' ')) {
			const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const regex = new RegExp(`\\b${escapedKw}\\b`, 'gu');
			let count = (cleanCv.match(regex) || []).length;

			// Check multi-word aliases that map to this keyword
			for (const [aliasPhrase, target] of multiWordAliases) {
				if (target === kw) {
					const escapedAlias = aliasPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					const aliasRegex = new RegExp(`\\b${escapedAlias}\\b`, 'gu');
					count += (cleanCv.match(aliasRegex) || []).length;
				}
			}

			if (count > 0) {
				const prev = finalCvTermCounts.get(kw) || 0;
				finalCvTermCounts.set(kw, prev + count);
				// Subtract from individual words
				const words = kw.split(' ');
				for (const word of words) {
					const existingCount = finalCvTermCounts.get(word) || 0;
					finalCvTermCounts.set(word, Math.max(0, existingCount - count));
				}
			}
		}
	}

	// Also explicitly check multi-word aliases that map to SINGLE-word controlled keywords
	// (e.g. "amazon web services" -> "aws")
	for (const [aliasPhrase, target] of multiWordAliases) {
		if (!target.includes(' ') && controlledKeywords.has(target)) {
			// Check JD
			const escapedAlias = aliasPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const aliasRegex = new RegExp(`\\b${escapedAlias}\\b`, 'gu');
			const jdCount = (cleanJd.match(aliasRegex) || []).length;
			if (jdCount > 0) {
				const existing = finalJdKeywords.find((k) => k.term === target);
				if (existing) {
					existing.count += jdCount;
				} else {
					finalJdKeywords.push({ term: target, count: jdCount });
				}
			}

			// Check CV
			const cvCount = (cleanCv.match(aliasRegex) || []).length;
			if (cvCount > 0) {
				const prev = finalCvTermCounts.get(target) || 0;
				finalCvTermCounts.set(target, prev + cvCount);
			}
		}
	}

	// BUG-19: Match Score Denominator Inflation
	// We only care about words that are in our controlled dictionaries for scoring
	const filteredJdKeywords = finalJdKeywords.filter(
		(k) => k.count > 0 && controlledKeywords.has(k.term)
	);

	const presentKeywords: KeywordResult[] = [];
	const missingKeywords: KeywordResult[] = [];

	// Map present and missing from all JD words (not just controlled) so uncontrolled features fall correctly into otherKeywords
	for (const kw of finalJdKeywords) {
		if (finalCvTermCounts.has(kw.term) && (finalCvTermCounts.get(kw.term) || 0) > 0) {
			presentKeywords.push({ ...kw, cvCount: finalCvTermCounts.get(kw.term) });
		} else {
			missingKeywords.push({ ...kw, cvCount: 0 });
		}
	}

	const presentControlled = presentKeywords.filter((k) => controlledKeywords.has(k.term));
	const matchScore =
		filteredJdKeywords.length > 0
			? Math.round((presentControlled.length / filteredJdKeywords.length) * 100)
			: 0;

	// Grouping with hierarchy to avoid double-assignment
	const groups = {
		technicalSkills: { present: [] as KeywordResult[], missing: [] as KeywordResult[] },
		abilities: { present: [] as KeywordResult[], missing: [] as KeywordResult[] },
		titleAndDegree: { present: [] as KeywordResult[], missing: [] as KeywordResult[] },
		otherKeywords: { present: [] as KeywordResult[], missing: [] as KeywordResult[] }
	};

	presentKeywords.forEach((kw) => {
		if (technicalSkillsKeywords.has(kw.term)) {
			groups.technicalSkills.present.push(kw);
		} else if (abilitiesKeywords.has(kw.term)) {
			groups.abilities.present.push(kw);
		} else if (titleAndDegreeKeywords.has(kw.term)) {
			groups.titleAndDegree.present.push(kw);
		} else {
			groups.otherKeywords.present.push(kw);
		}
	});

	missingKeywords.forEach((kw) => {
		if (technicalSkillsKeywords.has(kw.term)) {
			groups.technicalSkills.missing.push(kw);
		} else if (abilitiesKeywords.has(kw.term)) {
			groups.abilities.missing.push(kw);
		} else if (titleAndDegreeKeywords.has(kw.term)) {
			groups.titleAndDegree.missing.push(kw);
		} else {
			groups.otherKeywords.missing.push(kw);
		}
	});

	return {
		matchScore,
		presentKeywords,
		missingKeywords,
		groups
	};
}

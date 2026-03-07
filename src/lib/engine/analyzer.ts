import { stripHtmlAndMarkdown } from '../utils/parser';
import { extractKeywords } from './tokenizer';
import { i18n } from '../i18n.svelte';
import { escapeRegExp } from '../utils/regex';

const phraseRegexCache = new Map<string, RegExp>();
function getPhraseRegex(phrase: string): RegExp {
	if (!phraseRegexCache.has(phrase)) {
		const escaped = escapeRegExp(phrase);
		phraseRegexCache.set(phrase, new RegExp(`\\b${escaped}\\b`, 'gu'));
	}
	return phraseRegexCache.get(phrase) as RegExp;
}

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
			const regex = getPhraseRegex(kw);
			let count = (cleanJd.match(regex) || []).length;

			// Check multi-word aliases that map to this keyword
			for (const [aliasPhrase, target] of multiWordAliases) {
				if (target === kw) {
					const aliasRegex = getPhraseRegex(aliasPhrase);
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
				// Preserve component words for title phrases like "node.js developer"
				// so titles do not mask the underlying tech or generic role terms.
				if (!titleAndDegreeKeywords.has(kw)) {
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
	}

	// Process phrase keywords for CV
	const finalCvTermCounts = new Map(cvTermCounts);
	for (const kw of controlledKeywords) {
		if (kw.includes(' ')) {
			const regex = getPhraseRegex(kw);
			let count = (cleanCv.match(regex) || []).length;

			// Check multi-word aliases that map to this keyword
			for (const [aliasPhrase, target] of multiWordAliases) {
				if (target === kw) {
					const aliasRegex = getPhraseRegex(aliasPhrase);
					count += (cleanCv.match(aliasRegex) || []).length;
				}
			}

			if (count > 0) {
				const prev = finalCvTermCounts.get(kw) || 0;
				finalCvTermCounts.set(kw, prev + count);
				if (!titleAndDegreeKeywords.has(kw)) {
					const words = kw.split(' ');
					for (const word of words) {
						const existingCount = finalCvTermCounts.get(word) || 0;
						finalCvTermCounts.set(word, Math.max(0, existingCount - count));
					}
				}
			}
		}
	}

	// Also explicitly check multi-word aliases that map to SINGLE-word controlled keywords
	// (e.g. "amazon web services" -> "aws")
	for (const [aliasPhrase, target] of multiWordAliases) {
		if (!target.includes(' ') && controlledKeywords.has(target)) {
			// Check JD
			const aliasRegex = getPhraseRegex(aliasPhrase);
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

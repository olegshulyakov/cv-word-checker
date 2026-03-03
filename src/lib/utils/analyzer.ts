import { stripHtmlAndMarkdown } from './parser';

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

export function extractKeywords(text: string, stopWords: Set<string>): KeywordResult[] {
	if (!text) return [];

	const cleanText = stripHtmlAndMarkdown(text).toLowerCase();

	// Match words or multi-word terms. For now, simple word tokenization.
	// In the future, this could be enhanced to detect multi-word skills like 'machine learning'.
	// We replace non-alphanumeric (except basic punctuation used in tech like C#, C++, Node.js) with space
	const tokens = cleanText
		.replace(/[^\w\s+#.-]/g, ' ')
		.split(/\s+/)
		.map((t) => t.replace(/^[.-]+|[.-]+$/g, '')) // trim trailing/leading punctuation
		.filter((t) => t.length > 1 && !stopWords.has(t));

	const frequency: Record<string, number> = {};
	for (const token of tokens) {
		frequency[token] = (frequency[token] || 0) + 1;
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
	const cleanCv = stripHtmlAndMarkdown(cvText).toLowerCase();
	const cleanJd = stripHtmlAndMarkdown(jdText).toLowerCase();

	const jdKeywords = extractKeywords(jdText, stopWords);
	const cvKeywords = extractKeywords(cvText, stopWords);

	const cvTermCounts = new Map(cvKeywords.map((k) => [k.term, k.count]));

	// To handle multi-word phrase matching (BUG-03), we'll also check the full list of controlled keywords
	const controlledKeywords = new Set([
		...technicalSkillsKeywords,
		...abilitiesKeywords,
		...titleAndDegreeKeywords
	]);

	// Filter and combine results: standard single-word keywords + detected multi-word keywords
	// For JD
	const finalJdKeywords: KeywordResult[] = [...jdKeywords];
	for (const kw of controlledKeywords) {
		if (kw.includes(' ')) {
			// It's a phrase
			const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const regex = new RegExp(`\\b${escapedKw}\\b`, 'gu');
			const count = (cleanJd.match(regex) || []).length;
			if (count > 0) {
				if (!finalJdKeywords.some((k) => k.term === kw)) {
					finalJdKeywords.push({ term: kw, count });
				}
				// Subtract counts from individual words to avoid double-counting (BUG-03)
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

	// For CV
	const finalCvTermCounts = new Map(cvTermCounts);
	for (const kw of controlledKeywords) {
		if (kw.includes(' ')) {
			const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const regex = new RegExp(`\\b${escapedKw}\\b`, 'gu');
			const count = (cleanCv.match(regex) || []).length;
			if (count > 0) {
				finalCvTermCounts.set(kw, count);
				// Subtract from individual words
				const words = kw.split(' ');
				for (const word of words) {
					const existingCount = finalCvTermCounts.get(word) || 0;
					finalCvTermCounts.set(word, Math.max(0, existingCount - count));
				}
			}
		}
	}

	// Remove zero-count keywords from finalJdKeywords (those completely swallowed by phrases)
	const filteredJdKeywords = finalJdKeywords.filter((k) => k.count > 0);

	const presentKeywords: KeywordResult[] = [];
	const missingKeywords: KeywordResult[] = [];

	for (const kw of filteredJdKeywords) {
		if (finalCvTermCounts.has(kw.term) && (finalCvTermCounts.get(kw.term) || 0) > 0) {
			presentKeywords.push({ ...kw, cvCount: finalCvTermCounts.get(kw.term) });
		} else {
			missingKeywords.push({ ...kw, cvCount: 0 });
		}
	}

	const matchScore =
		filteredJdKeywords.length > 0
			? Math.round((presentKeywords.length / filteredJdKeywords.length) * 100)
			: 0;

	// Grouping with hierarchy to avoid double-assignment (BUG-05)
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

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
	const jdKeywords = extractKeywords(jdText, stopWords);
	const cvKeywords = extractKeywords(cvText, stopWords);

	const cvTermCounts = new Map(cvKeywords.map((k) => [k.term, k.count]));

	const presentKeywords: KeywordResult[] = [];
	const missingKeywords: KeywordResult[] = [];

	for (const kw of jdKeywords) {
		if (cvTermCounts.has(kw.term)) {
			presentKeywords.push({ ...kw, cvCount: cvTermCounts.get(kw.term) });
		} else {
			missingKeywords.push({ ...kw, cvCount: 0 });
		}
	}

	const matchScore =
		jdKeywords.length > 0 ? Math.round((presentKeywords.length / jdKeywords.length) * 100) : 0;

	// Grouping
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

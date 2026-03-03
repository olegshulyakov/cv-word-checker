import { stripHtmlAndMarkdown } from './parser';

export interface KeywordResult {
	term: string;
	count: number;
}

export interface MatchResults {
	matchScore: number;
	presentKeywords: KeywordResult[];
	missingKeywords: KeywordResult[];
	groups: {
		skills: { present: KeywordResult[]; missing: KeywordResult[] };
		other: { present: KeywordResult[]; missing: KeywordResult[] };
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
	skillsKeywords: Set<string>
): MatchResults {
	const jdKeywords = extractKeywords(jdText, stopWords);
	const cvKeywords = extractKeywords(cvText, stopWords);

	const cvTerms = new Set(cvKeywords.map((k) => k.term));

	const presentKeywords: KeywordResult[] = [];
	const missingKeywords: KeywordResult[] = [];

	for (const kw of jdKeywords) {
		if (cvTerms.has(kw.term)) {
			presentKeywords.push(kw);
		} else {
			missingKeywords.push(kw);
		}
	}

	const matchScore =
		jdKeywords.length > 0 ? Math.round((presentKeywords.length / jdKeywords.length) * 100) : 0;

	// Grouping
	const groups = {
		skills: { present: [] as KeywordResult[], missing: [] as KeywordResult[] },
		other: { present: [] as KeywordResult[], missing: [] as KeywordResult[] }
	};

	presentKeywords.forEach((kw) => {
		if (skillsKeywords.has(kw.term)) {
			groups.skills.present.push(kw);
		} else {
			groups.other.present.push(kw);
		}
	});

	missingKeywords.forEach((kw) => {
		if (skillsKeywords.has(kw.term)) {
			groups.skills.missing.push(kw);
		} else {
			groups.other.missing.push(kw);
		}
	});

	return {
		matchScore,
		presentKeywords,
		missingKeywords,
		groups
	};
}

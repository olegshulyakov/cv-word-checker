import { matchKeywords, type MatchResults } from './analyzer';
import { findWeakWords, type WeakWordFinding } from './wordcheck';

// In the future, this can be dynamically loaded based on the lang parameter
import { stopWords, weakWords, skillsKeywords } from '../dictionaries/en';

export interface AnalysisResults {
	match: MatchResults;
	weakWords: WeakWordFinding[];
	analysisTimeMs: number;
}

export async function analyze(cvText: string, jdText: string): Promise<AnalysisResults> {
	const start = performance.now();

	// In the future, we would dynamically load the dictionary based on `lang`
	// For now, we only have English, so we use the statically imported one.
	const currentStopWords = stopWords;
	const currentWeakWords = weakWords;
	const currentSkillsKeywords = skillsKeywords;

	const match = matchKeywords(cvText, jdText, currentStopWords, currentSkillsKeywords);
	const weakWordsFound = findWeakWords(cvText, currentWeakWords);

	const end = performance.now();

	return {
		match,
		weakWords: weakWordsFound,
		analysisTimeMs: Math.round(end - start)
	};
}

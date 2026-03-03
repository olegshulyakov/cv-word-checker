import { matchKeywords, type MatchResults } from './analyzer';
import { findWeakWords, type WeakWordFinding } from './wordcheck';
import { i18n } from '../i18n.svelte';

export interface AnalysisResults {
	match: MatchResults;
	weakWords: WeakWordFinding[];
	analysisTimeMs: number;
}

export async function analyze(cvText: string, jdText: string): Promise<AnalysisResults> {
	const start = performance.now();

	const dict = i18n.dict;
	if (!dict) {
		throw new Error('Dictionary not loaded');
	}

	const currentStopWords = new Set(dict.stopWords);
	const currentWeakWords = dict.weakWords;
	const currentSkillsKeywords = new Set(dict.skillsKeywords);

	const match = matchKeywords(cvText, jdText, currentStopWords, currentSkillsKeywords);
	const weakWordsFound = findWeakWords(cvText, currentWeakWords);

	const end = performance.now();

	return {
		match,
		weakWords: weakWordsFound,
		analysisTimeMs: Math.round(end - start)
	};
}

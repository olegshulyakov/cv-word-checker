import type { MatchResults } from './analyzer';
import type { WeakWordFinding } from './wordcheck';
import { i18n } from '../i18n.svelte';
import { aiAgents } from '../aiAgents';

export function getKeywordGaps(matchGroups: MatchResults['groups']): string {
	const missing = [
		...matchGroups.technicalSkills.missing,
		...matchGroups.abilities.missing,
		...matchGroups.otherKeywords.missing,
		...matchGroups.titleAndDegree.missing
	];
	const uniqueMissing = Array.from(new Set(missing.map((k) => k.term)));
	return uniqueMissing.length > 0 ? uniqueMissing.join(', ') : 'None';
}

export function getWeakPhrases(weakWords: WeakWordFinding[]): string {
	const phrases = weakWords.map((w) => w.originalPhrase);
	const uniquePhrases = Array.from(new Set(phrases));
	return uniquePhrases.length > 0 ? uniquePhrases.join(', ') : 'None';
}

export function buildPrompt(
	templateKey: string,
	matchGroups: MatchResults['groups'],
	weakWords: WeakWordFinding[],
	cvText: string,
	jdText: string
): string {
	const gaps = getKeywordGaps(matchGroups);
	const weak = getWeakPhrases(weakWords);

	let prompt = i18n.t(templateKey);
	prompt = prompt
		.replace('[KEYWORD_GAPS]', gaps)
		.replace('[WEAK_PHRASES]', weak)
		.replace('[JOB_DESCRIPTION]', jdText)
		.replace('[MY_CV]', cvText);

	return prompt;
}

export function openAgentUrl(agentId: string, prompt: string) {
	const agent = aiAgents.find((a) => a.id === agentId);
	if (!agent) return;
	if (agent.method === 'url') {
		const encodedPrompt = encodeURIComponent(prompt);
		const url = agent.urlTemplate.replace('{prompt}', encodedPrompt);
		window.open(url, '_blank');
	}
}

<script lang="ts">
	import type { AnalysisResults } from '$lib/utils/engine';
	import type { KeywordResult } from '$lib/utils/analyzer';
	import HighlightedCv from './HighlightedCv.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { aiAgents } from '$lib/aiAgents';

	let {
		results,
		cvText,
		jdText
	}: {
		results: AnalysisResults;
		cvText: string;
		jdText: string;
	} = $props();

	let scoreColor = $derived.by(() => {
		const score = results.match.matchScore;
		if (score >= 80) return 'var(--success-color)';
		if (score >= 50) return 'var(--warning-color)';
		return 'var(--error-color)';
	});

	function getScoreLabel(score: number) {
		if (score >= 80) return i18n.t('results.scoreExcellent');
		if (score >= 50) return i18n.t('results.scoreFair');
		return i18n.t('results.scoreNeedsImprovement');
	}

	let selectedAgentId = $state(aiAgents[0].id);
	let showToast = $state(false);

	function getKeywordGaps(): string {
		const groups = results.match.groups;
		const missing = [
			...groups.technicalSkills.missing,
			...groups.abilities.missing,
			...groups.otherKeywords.missing,
			...groups.titleAndDegree.missing
		];
		const uniqueMissing = Array.from(new Set(missing.map((k) => k.term)));
		return uniqueMissing.length > 0 ? uniqueMissing.join(', ') : 'None';
	}

	function getWeakPhrases(): string {
		const phrases = results.weakWords.map((w) => w.originalPhrase);
		const uniquePhrases = Array.from(new Set(phrases));
		return uniquePhrases.length > 0 ? uniquePhrases.join(', ') : 'None';
	}

	async function rewriteWithAi() {
		const agent = aiAgents.find((a) => a.id === selectedAgentId);
		if (!agent) return;

		const gaps = getKeywordGaps();
		const weak = getWeakPhrases();

		let prompt = i18n.t('results.rewritePromptTemplate');
		prompt = prompt
			.replace('[KEYWORD_GAPS]', gaps)
			.replace('[WEAK_PHRASES]', weak)
			.replace('[JOB_DESCRIPTION]', jdText)
			.replace('[MY_CV]', cvText);

		await copyToClipboard(prompt);

		if (agent.method === 'url') {
			// Wait 5 seconds before redirecting
			setTimeout(() => {
				const encodedPrompt = encodeURIComponent(prompt);
				const url = agent.urlTemplate.replace('{prompt}', encodedPrompt);
				window.open(url, '_blank');
			}, 5000);
		}
	}

	async function checkCandidateWithAi() {
		const agent = aiAgents.find((a) => a.id === selectedAgentId);
		if (!agent) return;

		const gaps = getKeywordGaps();
		const weak = getWeakPhrases();

		let prompt = i18n.t('results.checkCandidatePromptTemplate');
		prompt = prompt
			.replace('[KEYWORD_GAPS]', gaps)
			.replace('[WEAK_PHRASES]', weak)
			.replace('[JOB_DESCRIPTION]', jdText)
			.replace('[MY_CV]', cvText);

		await copyToClipboard(prompt);

		if (agent.method === 'url') {
			// Wait 5 seconds before redirecting
			setTimeout(() => {
				const encodedPrompt = encodeURIComponent(prompt);
				const url = agent.urlTemplate.replace('{prompt}', encodedPrompt);
				window.open(url, '_blank');
			}, 5000);
		}
	}

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			showToast = true;
			setTimeout(() => {
				showToast = false;
			}, 3000);
		} catch (err) {
			console.error('Failed to copy prompt to clipboard', err);
		}
	}
</script>

<section class="results-panel">
	<div class="header-section">
		<h2>{i18n.t('results.title')}</h2>
		<div class="score-container">
			<div
				class="score-ring"
				role="img"
				aria-label="Match score: {results.match.matchScore}% - {getScoreLabel(
					results.match.matchScore
				)}"
				style="--score: {results.match.matchScore}; --score-color: {scoreColor};"
			>
				<div class="score-inner">
					<span class="score-value" aria-hidden="true">{results.match.matchScore}%</span>
				</div>
			</div>
			<div class="score-text">
				<strong>{getScoreLabel(results.match.matchScore)}</strong>
				<span class="time-label">{i18n.t('results.analyzedIn')} {results.analysisTimeMs}ms</span>
			</div>
		</div>
	</div>

	<div class="ai-rewrite-section">
		<div class="ai-controls">
			<select bind:value={selectedAgentId} class="agent-select">
				{#each aiAgents as agent (agent.id)}
					<option value={agent.id}>{agent.name}</option>
				{/each}
			</select>
			<button onclick={rewriteWithAi} class="btn-primary">
				{i18n.t('results.rewriteWithAi')}
			</button>
			<button onclick={checkCandidateWithAi} class="btn-secondary">
				{i18n.t('results.checkCandidateWithAi')}
			</button>
		</div>
		{#if showToast}
			<div class="toast" role="alert">{i18n.t('results.rewritePromptCopied')}</div>
		{/if}
	</div>

	{#snippet keywordBlock(
		title: string,
		group: { present: KeywordResult[]; missing: KeywordResult[] },
		emptyStateMsg: string
	)}
		<div class="keywords-section">
			<h3>{title}</h3>
			<div class="table-container">
				<table class="keywordtable">
					<thead>
						<tr>
							<th>{i18n.t('results.tableKeyword')}</th>
							<th class="text-center">{i18n.t('results.tableFoundInCv')}</th>
							<th class="text-center">{i18n.t('results.tableFoundInPd')}</th>
						</tr>
					</thead>
					<tbody>
						{#each group.present as kw (kw.term)}
							<tr>
								<td>
									<span class="status-icon present" aria-hidden="true">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg
										>
									</span>
									<strong>{kw.term}</strong>
								</td>
								<td class="text-center count-cell">{kw.cvCount || 0}</td>
								<td class="text-center count-cell">{kw.count}</td>
							</tr>
						{/each}
						{#each group.missing as kw (kw.term)}
							<tr class="missing-row">
								<td>
									<span class="status-icon missing" aria-hidden="true">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><line x1="18" y1="6" x2="6" y2="18"></line><line
												x1="6"
												y1="6"
												x2="18"
												y2="18"
											></line></svg
										>
									</span>
									<strong>{kw.term}</strong>
								</td>
								<td class="text-center count-cell warning-text">0</td>
								<td class="text-center count-cell">{kw.count}</td>
							</tr>
						{/each}
						{#if group.present.length === 0 && group.missing.length === 0}
							<tr>
								<td colspan="3" class="empty-state text-center">
									{emptyStateMsg}
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{/snippet}

	{#if results.match.groups.technicalSkills.present.length > 0 || results.match.groups.technicalSkills.missing.length > 0}
		{@render keywordBlock(
			i18n.t('results.technicalSkillsTitle'),
			results.match.groups.technicalSkills,
			i18n.t('results.noMatchingSkills')
		)}
	{/if}

	{#if results.match.groups.abilities.present.length > 0 || results.match.groups.abilities.missing.length > 0}
		{@render keywordBlock(
			i18n.t('results.abilitiesTitle'),
			results.match.groups.abilities,
			i18n.t('results.noMatchingAbilities')
		)}
	{/if}

	{#if results.match.groups.otherKeywords.present.length > 0 || results.match.groups.otherKeywords.missing.length > 0}
		{@render keywordBlock(
			i18n.t('results.otherKeywordsTitle'),
			results.match.groups.otherKeywords,
			i18n.t('results.noOtherMatching')
		)}
	{/if}

	{#if results.match.groups.titleAndDegree.present.length > 0 || results.match.groups.titleAndDegree.missing.length > 0}
		{@render keywordBlock(
			i18n.t('results.titleAndDegreeTitle'),
			results.match.groups.titleAndDegree,
			i18n.t('results.noMatchingTitleDegree')
		)}
	{/if}

	<div class="weak-words-section">
		<h3>{i18n.t('results.weakWordsTitle')} ({results.weakWords.length})</h3>
		<p class="section-desc">
			{i18n.t('results.weakWordsDesc')}
		</p>

		{#if results.weakWords.length > 0}
			<HighlightedCv text={cvText} findings={results.weakWords} />
		{:else}
			<div class="empty-state success">
				<p>{i18n.t('results.weakWordsSuccess')}</p>
			</div>
		{/if}
	</div>
</section>

<style>
	.results-panel {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.header-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-color);
	}

	@media (min-width: 640px) {
		.header-section {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}

	.header-section h2 {
		margin: 0;
		font-size: 1.75rem;
	}

	.score-container {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.score-ring {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: conic-gradient(
			var(--score-color) 0%,
			var(--score-color) calc(var(--score) * 1%),
			var(--border-color) calc(var(--score) * 1%),
			var(--border-color) 100%
		);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.score-inner {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: var(--bg-color);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.score-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-color);
	}

	.score-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.score-text strong {
		font-size: 1.125rem;
	}

	.time-label {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	h3 {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.table-container {
		width: 100%;
		overflow-x: auto;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		background: var(--bg-color);
	}

	.keywordtable {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 0.9375rem;
	}

	.keywordtable th,
	.keywordtable td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	.keywordtable th {
		background-color: rgba(0, 0, 0, 0.03);
		font-weight: 600;
		color: var(--text-color);
	}

	:global([data-theme='dark']) .keywordtable th {
		background-color: rgba(255, 255, 255, 0.03);
	}

	.keywordtable tr:last-child td {
		border-bottom: none;
	}

	.keywordtable tbody tr:hover {
		background-color: var(--surface-hover);
		opacity: 0.8;
	}

	.missing-row {
		background-color: rgba(217, 119, 87, 0.02);
	}

	:global([data-theme='dark']) .missing-row {
		background-color: rgba(217, 119, 87, 0.05);
	}

	.text-center {
		text-align: center !important;
	}

	.count-cell {
		font-variant-numeric: tabular-nums;
		font-weight: 500;
	}

	.warning-text {
		color: var(--accent-color);
	}

	.status-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-right: 0.5rem;
		vertical-align: middle;
	}

	.status-icon.present {
		color: var(--success-color);
	}

	.status-icon.missing {
		color: var(--accent-color);
	}

	.empty-state {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-style: italic;
		padding: 1.5rem !important;
	}

	.empty-state.success {
		font-style: normal;
		padding: 1rem !important;
		background-color: rgba(16, 185, 129, 0.1);
		color: var(--success-color);
		border-radius: 8px;
		border: 1px solid rgba(16, 185, 129, 0.2);
		text-align: left !important;
	}

	.weak-words-section {
		margin-top: 1rem;
	}

	.section-desc {
		margin: 0 0 1.5rem 0;
		color: var(--text-muted);
	}

	.ai-rewrite-section {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		position: relative;
		padding: 1rem;
		background-color: var(--surface-hover);
		border-radius: 8px;
		border: 1px solid var(--border-color);
	}

	.ai-controls {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.agent-select {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid var(--border-color);
		background: var(--surface-color);
		color: var(--text-color);
		font-size: 0.9375rem;
		height: 38px;
	}

	.agent-select:focus {
		outline: none;
		border-color: var(--accent-color);
		box-shadow: 0 0 0 3px var(--focus-ring);
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.5rem 1.25rem;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s,
			color 0.2s;
		height: 38px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.btn-primary {
		background: var(--accent-color);
		color: var(--bg-color);
		border: 1px solid var(--accent-color);
	}

	.btn-primary:hover {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}

	.btn-secondary {
		background: transparent;
		color: var(--text-color);
		border: 1px solid var(--border-color);
	}

	.btn-secondary:hover {
		background: var(--surface-hover);
		border-color: var(--text-muted);
	}

	.toast {
		padding: 0.5rem 1rem;
		background-color: var(--success-color);
		color: var(--bg-color);
		border-radius: 6px;
		font-size: 0.875rem;
		animation: fadeInOut 3s forwards;
		font-weight: 500;
	}

	@keyframes fadeInOut {
		0% {
			opacity: 0;
			transform: translateY(10px);
		}
		10% {
			opacity: 1;
			transform: translateY(0);
		}
		90% {
			opacity: 1;
			transform: translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateY(-10px);
		}
	}
</style>

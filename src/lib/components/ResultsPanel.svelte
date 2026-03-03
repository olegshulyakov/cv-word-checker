<script lang="ts">
	import type { AnalysisResults } from '$lib/utils/engine';
	import HighlightedCv from './HighlightedCv.svelte';
	import { i18n } from '$lib/i18n.svelte';

	let {
		results,
		cvText
	}: {
		results: AnalysisResults;
		cvText: string;
	} = $props();

	let scoreColor = $derived.by(() => {
		const score = results.match.matchScore;
		if (score >= 80) return '#10b981'; // emerald-500
		if (score >= 50) return '#f59e0b'; // amber-500
		return '#ef4444'; // red-500
	});

	function getScoreLabel(score: number) {
		if (score >= 80) return i18n.t('results.scoreExcellent');
		if (score >= 50) return i18n.t('results.scoreFair');
		return i18n.t('results.scoreNeedsImprovement');
	}
</script>

<section class="results-panel" aria-live="polite">
	<div class="header-section">
		<h2>{i18n.t('results.title')}</h2>
		<div class="score-container">
			<div
				class="score-ring"
				style="--score: {results.match.matchScore}; --score-color: {scoreColor};"
			>
				<div class="score-inner">
					<span class="score-value">{results.match.matchScore}%</span>
				</div>
			</div>
			<div class="score-text">
				<strong>{getScoreLabel(results.match.matchScore)}</strong>
				<span class="time-label">{i18n.t('results.analyzedIn')} {results.analysisTimeMs}ms</span>
			</div>
		</div>
	</div>

	<div class="keywords-section">
		<h3>{i18n.t('results.skillsTitle')}</h3>
		<div class="keyword-lists">
			<div class="keyword-list">
				<h4>
					{i18n.t('results.presentInCv')}
					<span class="count">({results.match.groups.skills.present.length})</span>
				</h4>
				<ul class="chips">
					{#each results.match.groups.skills.present as kw (kw.term)}
						<li class="chip chip-present">
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
								class="chip-icon"><polyline points="20 6 9 17 4 12"></polyline></svg
							>
							{kw.term} <span class="freq">({kw.count})</span>
						</li>
					{:else}
						<li class="empty-state">{i18n.t('results.noMatchingSkills')}</li>
					{/each}
				</ul>
			</div>

			<div class="keyword-list">
				<h4>
					{i18n.t('results.missingFromCv')}
					<span class="count">({results.match.groups.skills.missing.length})</span>
				</h4>
				<ul class="chips">
					{#each results.match.groups.skills.missing as kw (kw.term)}
						<li class="chip chip-missing">
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
								class="chip-icon"
								><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
								></line></svg
							>
							{kw.term}
						</li>
					{:else}
						<li class="empty-state">{i18n.t('results.noMissingSkills')}</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<div class="keywords-section">
		<h3>{i18n.t('results.otherTermsTitle')}</h3>
		<div class="keyword-lists">
			<div class="keyword-list">
				<h4>
					{i18n.t('results.presentInCv')}
					<span class="count">({results.match.groups.other.present.length})</span>
				</h4>
				<ul class="chips">
					{#each results.match.groups.other.present as kw (kw.term)}
						<li class="chip chip-present">
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
								class="chip-icon"><polyline points="20 6 9 17 4 12"></polyline></svg
							>
							{kw.term} <span class="freq">({kw.count})</span>
						</li>
					{:else}
						<li class="empty-state">{i18n.t('results.noOtherMatching')}</li>
					{/each}
				</ul>
			</div>

			<div class="keyword-list">
				<h4>
					{i18n.t('results.missingFromCv')}
					<span class="count">({results.match.groups.other.missing.length})</span>
				</h4>
				<ul class="chips">
					{#each results.match.groups.other.missing as kw (kw.term)}
						<li class="chip chip-missing">
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
								class="chip-icon"
								><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
								></line></svg
							>
							{kw.term}
						</li>
					{:else}
						<li class="empty-state">{i18n.t('results.noOtherMissing')}</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

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
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.header-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-color);
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
		background: conic-gradient(var(--score-color) calc(var(--score) * 1%), var(--border-color) 0);
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

	h4 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.count {
		font-size: 0.875rem;
		font-weight: normal;
		opacity: 0.8;
	}

	.keyword-lists {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.keyword-lists {
			grid-template-columns: 1fr 1fr;
		}
	}

	.chips {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.75rem;
		border-radius: 16px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.chip-icon {
		flex-shrink: 0;
	}

	.chip-present {
		background-color: rgba(16, 185, 129, 0.1); /* emerald-500 tint */
		color: #059669; /* emerald-600 */
		border: 1px solid rgba(16, 185, 129, 0.2);
	}

	:global([data-theme='dark']) .chip-present {
		color: #34d399; /* emerald-400 */
	}

	.chip-missing {
		background-color: rgba(245, 158, 11, 0.1); /* amber-500 tint */
		color: #d97706; /* amber-600 */
		border: 1px solid rgba(245, 158, 11, 0.2);
	}

	:global([data-theme='dark']) .chip-missing {
		color: #fbbf24; /* amber-400 */
	}

	.freq {
		opacity: 0.7;
		font-size: 0.75rem;
	}

	.empty-state {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-style: italic;
	}

	.empty-state.success {
		font-style: normal;
		padding: 1rem;
		background-color: rgba(16, 185, 129, 0.1);
		color: #059669;
		border-radius: 8px;
		border: 1px solid rgba(16, 185, 129, 0.2);
	}

	:global([data-theme='dark']) .empty-state.success {
		color: #34d399;
	}

	.weak-words-section {
		margin-top: 1rem;
	}

	.section-desc {
		margin: 0 0 1.5rem 0;
		color: var(--text-muted);
	}
</style>

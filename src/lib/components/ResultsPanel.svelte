<script lang="ts">
	import type { AnalysisResults } from '$lib/engine/engine';
	import HighlightedCv from './HighlightedCv.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import ScoreHeader from './ScoreHeader.svelte';
	import AiActions from './AiActions.svelte';
	import KeywordTable from './KeywordTable.svelte';

	let {
		results,
		cvText,
		jdText
	}: {
		results: AnalysisResults;
		cvText: string;
		jdText: string;
	} = $props();
</script>

<section class="results-panel">
	<div class="header-section">
		<h2>{i18n.t('results.title')}</h2>
		<ScoreHeader match={results.match}>
			{i18n.t('results.analyzedIn')}
			{results.analysisTimeMs}ms
		</ScoreHeader>
	</div>

	<AiActions matchGroups={results.match.groups} weakWords={results.weakWords} {cvText} {jdText} />

	{#if results.match.groups.technicalSkills.present.length > 0 || results.match.groups.technicalSkills.missing.length > 0}
		<KeywordTable
			title={i18n.t('results.technicalSkillsTitle')}
			group={results.match.groups.technicalSkills}
			emptyStateMsg={i18n.t('results.noMatchingSkills')}
		/>
	{/if}

	{#if results.match.groups.abilities.present.length > 0 || results.match.groups.abilities.missing.length > 0}
		<KeywordTable
			title={i18n.t('results.abilitiesTitle')}
			group={results.match.groups.abilities}
			emptyStateMsg={i18n.t('results.noMatchingAbilities')}
		/>
	{/if}

	{#if results.match.groups.otherKeywords.present.length > 0 || results.match.groups.otherKeywords.missing.length > 0}
		<KeywordTable
			title={i18n.t('results.otherKeywordsTitle')}
			group={results.match.groups.otherKeywords}
			emptyStateMsg={i18n.t('results.noOtherMatching')}
		/>
	{/if}

	{#if results.match.groups.titleAndDegree.present.length > 0 || results.match.groups.titleAndDegree.missing.length > 0}
		<KeywordTable
			title={i18n.t('results.titleAndDegreeTitle')}
			group={results.match.groups.titleAndDegree}
			emptyStateMsg={i18n.t('results.noMatchingTitleDegree')}
		/>
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

	.weak-words-section {
		margin-top: 1rem;
	}

	h3 {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.section-desc {
		margin: 0 0 1.5rem 0;
		color: var(--text-muted);
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
</style>

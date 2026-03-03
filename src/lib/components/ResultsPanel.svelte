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
					{#each results.match.groups.skills.present as kw (kw.term)}
						<tr>
							<td>
								<span class="status-icon present">
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
					{#each results.match.groups.skills.missing as kw (kw.term)}
						<tr class="missing-row">
							<td>
								<span class="status-icon missing">
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
										><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
										></line></svg
									>
								</span>
								<strong>{kw.term}</strong>
							</td>
							<td class="text-center count-cell error-text">0</td>
							<td class="text-center count-cell">{kw.count}</td>
						</tr>
					{/each}
					{#if results.match.groups.skills.present.length === 0 && results.match.groups.skills.missing.length === 0}
						<tr>
							<td colspan="3" class="empty-state text-center">
								{i18n.t('results.noMatchingSkills')}
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<div class="keywords-section">
		<h3>{i18n.t('results.otherTermsTitle')}</h3>
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
					{#each results.match.groups.other.present as kw (kw.term)}
						<tr>
							<td>
								<span class="status-icon present">
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
					{#each results.match.groups.other.missing as kw (kw.term)}
						<tr class="missing-row">
							<td>
								<span class="status-icon missing">
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
										><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
										></line></svg
									>
								</span>
								<strong>{kw.term}</strong>
							</td>
							<td class="text-center count-cell error-text">0</td>
							<td class="text-center count-cell">{kw.count}</td>
						</tr>
					{/each}
					{#if results.match.groups.other.present.length === 0 && results.match.groups.other.missing.length === 0}
						<tr>
							<td colspan="3" class="empty-state text-center">
								{i18n.t('results.noOtherMatching')}
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
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
		background-color: rgba(0, 0, 0, 0.015);
	}

	:global([data-theme='dark']) .keywordtable tbody tr:hover {
		background-color: rgba(255, 255, 255, 0.015);
	}

	.missing-row {
		background-color: rgba(245, 158, 11, 0.02);
	}

	:global([data-theme='dark']) .missing-row {
		background-color: rgba(245, 158, 11, 0.05);
	}

	.text-center {
		text-align: center !important;
	}

	.count-cell {
		font-variant-numeric: tabular-nums;
		font-weight: 500;
	}

	.error-text {
		color: #d97706;
	}

	:global([data-theme='dark']) .error-text {
		color: #fbbf24;
	}

	.status-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-right: 0.5rem;
		vertical-align: middle;
	}

	.status-icon.present {
		color: #059669;
	}

	:global([data-theme='dark']) .status-icon.present {
		color: #34d399;
	}

	.status-icon.missing {
		color: #d97706;
	}

	:global([data-theme='dark']) .status-icon.missing {
		color: #fbbf24;
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
		color: #059669;
		border-radius: 8px;
		border: 1px solid rgba(16, 185, 129, 0.2);
		text-align: left !important;
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

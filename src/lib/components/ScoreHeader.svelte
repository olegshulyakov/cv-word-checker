<script lang="ts">
	import { i18n } from '$lib/i18n.svelte';
	import type { MatchResults } from '$lib/engine/analyzer';
	import type { Snippet } from 'svelte';

	let {
		match,
		children
	}: {
		match: MatchResults;
		children?: Snippet;
	} = $props();

	let scoreColor = $derived.by(() => {
		const score = match.matchScore;
		if (score >= 80) return 'var(--success-color)';
		if (score >= 50) return 'var(--warning-color)';
		return 'var(--error-color)';
	});

	function getScoreLabel(score: number) {
		if (score >= 80) return i18n.t('results.scoreExcellent');
		if (score >= 50) return i18n.t('results.scoreFair');
		return i18n.t('results.scoreNeedsImprovement');
	}
</script>

<div class="score-container">
	<div
		class="score-ring"
		role="img"
		aria-label="Match score: {match.matchScore}% - {getScoreLabel(match.matchScore)}"
		style="--score: {match.matchScore}; --score-color: {scoreColor};"
	>
		<div class="score-inner">
			<span class="score-value" aria-hidden="true">{match.matchScore}%</span>
		</div>
	</div>
	<div class="score-text">
		<strong>{getScoreLabel(match.matchScore)}</strong>
		<span class="time-label">
			{#if children}
				{@render children()}
			{/if}
		</span>
	</div>
</div>

<style>
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
</style>

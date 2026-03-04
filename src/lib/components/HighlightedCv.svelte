<script lang="ts">
	import type { WeakWordFinding } from '$lib/utils/wordcheck';
	import { i18n } from '$lib/i18n.svelte';

	let {
		text,
		findings
	}: {
		text: string;
		findings: WeakWordFinding[];
	} = $props();

	type Segment = { type: 'text' | 'highlight'; content: string; finding?: WeakWordFinding };

	// Split text into segments: normal text and highlighted text
	let segments = $derived.by<Segment[]>(() => {
		if (!findings || findings.length === 0) {
			return [{ type: 'text', content: text }];
		}

		const result: Segment[] = [];
		let currentIndex = 0;

		for (const finding of findings) {
			// Skip if this finding starts before where we already are (overlap)
			if (finding.startIndex < currentIndex) continue;

			if (finding.startIndex > currentIndex) {
				result.push({
					type: 'text',
					content: text.slice(currentIndex, finding.startIndex)
				});
			}

			result.push({
				type: 'highlight',
				content: text.slice(finding.startIndex, finding.endIndex),
				finding
			});
			currentIndex = finding.endIndex;
		}

		if (currentIndex < text.length) {
			result.push({
				type: 'text',
				content: text.slice(currentIndex)
			});
		}

		return result;
	});
</script>

<div class="highlighted-cv">
	{#each segments as segment, i (segment.type === 'highlight' ? `h-${segment.finding?.startIndex}` : `t-${i}`)}
		{#if segment.type === 'text'}
			<span class="text-segment">{segment.content}</span>
		{:else if segment.type === 'highlight' && segment.finding}
			<span
				class="highlight-wrapper"
				tabindex="0"
				role="button"
				aria-label="{i18n.t('results.weakWordsTooltipTitle')}: {segment.content}. {i18n.t(
					'results.weakWordsTooltipPrefix'
				)} {segment.finding.suggestions.join(', ')}"
			>
				<mark class="highlight-mark">{segment.content}</mark>
				<span class="tooltip" aria-hidden="true">
					<strong>{i18n.t('results.weakWordsTooltipTitle')}</strong><br />
					{i18n.t('results.weakWordsTooltipPrefix')}
					<ul class="suggestion-list">
						{#each segment.finding.suggestions as suggestion (suggestion)}
							<li>{suggestion}</li>
						{/each}
					</ul>
				</span>
			</span>
		{/if}
	{/each}
</div>

<style>
	.highlighted-cv {
		white-space: pre-wrap;
		font-family: inherit;
		line-height: 1.6;
		padding: 1rem;
		background: var(--surface-color);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		color: var(--text-color);
	}

	.highlight-wrapper {
		position: relative;
		display: inline-block;
		cursor: help;
		outline: none;
	}

	.highlight-mark {
		background-color: rgba(255, 193, 7, 0.3); /* Amber background */
		border-bottom: 2px solid #ffc107;
		border-radius: 2px;
		padding: 0 2px;
		color: inherit;
		transition: background-color 0.2s;
	}

	.highlight-wrapper:hover .highlight-mark,
	.highlight-wrapper:focus .highlight-mark {
		background-color: rgba(255, 193, 7, 0.5);
	}

	.highlight-wrapper:focus-visible .highlight-mark {
		box-shadow: 0 0 0 2px var(--focus-ring);
	}

	.tooltip {
		visibility: hidden;
		width: max-content;
		max-width: 250px;
		background-color: var(--text-color);
		color: var(--surface-color);
		text-align: left;
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
		position: absolute;
		z-index: 10;
		bottom: 125%;
		left: 50%;
		transform: translateX(-50%);
		opacity: 0;
		transition:
			opacity 0.2s,
			visibility 0.2s,
			transform 0.2s;
		font-size: 0.875rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		pointer-events: none;
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: var(--text-color) transparent transparent transparent;
	}

	.highlight-wrapper:hover .tooltip,
	.highlight-wrapper:focus-within .tooltip {
		visibility: visible;
		opacity: 1;
		transform: translateX(-50%) translateY(-4px);
	}

	strong {
		color: #ffc107;
	}

	.suggestion-list {
		margin: 0;
		padding: 0 0 0 1.25rem;
		list-style: disc;
	}

	.suggestion-list li {
		margin-bottom: 0.1rem;
	}

	.suggestion-list li:last-child {
		margin-bottom: 0;
	}
</style>

<script lang="ts">
	import type { WeakWordFinding } from '$lib/utils/wordcheck';

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
			if (finding.startIndex > currentIndex) {
				result.push({
					type: 'text',
					content: text.slice(currentIndex, finding.startIndex)
				});
			}

			// In case of overlapping findings (shouldn't happen with our current logic, but just in case)
			if (finding.startIndex >= currentIndex) {
				result.push({
					type: 'highlight',
					content: text.slice(finding.startIndex, finding.endIndex),
					finding
				});
				currentIndex = finding.endIndex;
			}
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
	{#each segments as segment, i (i)}
		{#if segment.type === 'text'}
			<span class="text-segment">{segment.content}</span>
		{:else if segment.type === 'highlight' && segment.finding}
			<span class="highlight-wrapper">
				<mark class="highlight-mark">{segment.content}</mark>
				<span class="tooltip">
					<strong>Weak Phrase</strong><br />
					Consider: {segment.finding.suggestions.join(', ')}
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
	}

	.highlight-mark {
		background-color: rgba(255, 193, 7, 0.3); /* Amber background */
		border-bottom: 2px solid #ffc107;
		border-radius: 2px;
		padding: 0 2px;
		color: inherit;
	}

	.tooltip {
		visibility: hidden;
		width: max-content;
		max-width: 250px;
		background-color: var(--text-color);
		color: var(--surface-color);
		text-align: left;
		border-radius: 6px;
		padding: 0.5rem 0.75rem;
		position: absolute;
		z-index: 10;
		bottom: 125%;
		left: 50%;
		transform: translateX(-50%);
		opacity: 0;
		transition: opacity 0.2s;
		font-size: 0.875rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

	.highlight-wrapper:hover .tooltip {
		visibility: visible;
		opacity: 1;
	}

	strong {
		display: block;
		margin-bottom: 0.25rem;
		color: #ffc107;
	}
</style>

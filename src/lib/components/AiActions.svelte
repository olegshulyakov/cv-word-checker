<script lang="ts">
	import { Sparkles, UserCheck } from 'lucide-svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { aiAgents } from '$lib/aiAgents';
	import { createPersistentState, STORAGE_KEYS } from '$lib/state.svelte';
	import { buildPrompt, openAgentUrl } from '$lib/utils/promptBuilder';
	import type { MatchResults } from '$lib/utils/analyzer';
	import type { WeakWordFinding } from '$lib/utils/wordcheck';

	let {
		matchGroups,
		weakWords,
		cvText,
		jdText
	}: {
		matchGroups: MatchResults['groups'];
		weakWords: WeakWordFinding[];
		cvText: string;
		jdText: string;
	} = $props();

	const selectedAgent = createPersistentState(STORAGE_KEYS.AI_AGENT, aiAgents[0].id);
	let showToast = $state(false);

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

	async function handleAction(type: 'rewrite' | 'check') {
		const agent = aiAgents.find((a) => a.id === selectedAgent.value);
		if (!agent) return;

		const templateKey =
			type === 'rewrite' ? 'results.rewritePromptTemplate' : 'results.checkCandidatePromptTemplate';
		const prompt = buildPrompt(templateKey, matchGroups, weakWords, cvText, jdText);

		await copyToClipboard(prompt);

		if (agent.method === 'url') {
			setTimeout(() => {
				openAgentUrl(selectedAgent.value, prompt);
			}, 2000);
		}
	}
</script>

<div class="ai-rewrite-section">
	<div class="ai-controls">
		<select bind:value={selectedAgent.value} class="agent-select">
			{#each aiAgents as agent (agent.id)}
				<option value={agent.id}>{agent.name}</option>
			{/each}
		</select>
		<button onclick={() => handleAction('rewrite')} class="btn-primary">
			<Sparkles size={18} />
			{i18n.t('results.rewriteWithAi')}
		</button>
		<button onclick={() => handleAction('check')} class="btn-secondary">
			<UserCheck size={18} />
			{i18n.t('results.checkCandidateWithAi')}
		</button>
	</div>
	{#if showToast}
		<div class="toast" role="alert">{i18n.t('results.rewritePromptCopied')}</div>
	{/if}
</div>

<style>
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
		gap: 0.5rem;
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

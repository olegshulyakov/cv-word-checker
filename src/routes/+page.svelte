<script lang="ts">
	import { createPersistentState, STORAGE_KEYS } from '$lib/state.svelte';
	import { readFileAsText } from '$lib/utils/file';
	import { analyze, type AnalysisResults } from '$lib/utils/engine';
	import ResultsPanel from '$lib/components/ResultsPanel.svelte';
	import { i18n } from '$lib/i18n.svelte';

	const cvText = createPersistentState(STORAGE_KEYS.CV, '');
	const jdText = createPersistentState(STORAGE_KEYS.JD, '');
	let analyzing = $state(false);
	let analysisResult = $state<AnalysisResults | null>(null);

	async function handleDrop(e: DragEvent, type: 'cv' | 'jd') {
		e.preventDefault();
		const file = e.dataTransfer?.files[0];
		if (file) {
			const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
			if (file.size > MAX_FILE_SIZE) {
				alert(i18n.t('page.fileTooLarge'));
				return;
			}
			const ext = file.name.split('.').pop()?.toLowerCase();
			if (['txt', 'md', 'html'].includes(ext || '')) {
				const text = await readFileAsText(file);
				if (type === 'cv') {
					cvText.value = text;
				} else {
					jdText.value = text;
				}
			} else {
				alert(i18n.t('page.fileError'));
			}
		}
	}

	async function handleAnalyze() {
		if (!cvText.value.trim() || !jdText.value.trim()) return;

		analyzing = true;

		try {
			analysisResult = await analyze(cvText.value, jdText.value);
		} finally {
			analyzing = false;
		}
	}
</script>

<div class="page-container">
	<header class="page-header">
		<h1>{i18n.t('page.title')}</h1>
		<p>
			{i18n.t('page.subtitle')}
		</p>
	</header>

	<div class="inputs-grid">
		<div class="input-group">
			<label for="cv">{i18n.t('page.cvLabel')}</label>
			<textarea
				id="cv"
				bind:value={cvText.value}
				ondrop={(e) => handleDrop(e, 'cv')}
				ondragover={(e) => e.preventDefault()}
				placeholder={i18n.t('page.cvPlaceholder')}
				spellcheck="false"
			></textarea>
		</div>

		<div class="input-group">
			<label for="jd">{i18n.t('page.jdLabel')}</label>
			<textarea
				id="jd"
				bind:value={jdText.value}
				ondrop={(e) => handleDrop(e, 'jd')}
				ondragover={(e) => e.preventDefault()}
				placeholder={i18n.t('page.jdPlaceholder')}
				spellcheck="false"
			></textarea>
		</div>
	</div>

	{#if cvText.value.trim() && jdText.value.trim()}
		<div class="actions">
			<button class="btn-primary" onclick={handleAnalyze} disabled={analyzing}>
				{#if analyzing}
					{i18n.t('page.analyzingBtn')}
				{:else}
					{i18n.t('page.analyzeBtn')}
				{/if}
			</button>
		</div>
	{/if}

	{#if analysisResult}
		<ResultsPanel results={analysisResult} cvText={cvText.value} />
	{/if}
</div>

<style>
	.page-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.page-header {
		text-align: center;
		margin-bottom: 1rem;
	}

	.page-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-color);
	}

	.page-header p {
		color: var(--text-muted);
		font-size: 1.125rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.inputs-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.inputs-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		color: var(--text-color);
		font-size: 0.9375rem;
	}

	textarea {
		height: 400px;
		font-size: 0.9375rem;
		line-height: 1.5;
	}

	.actions {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

	.btn-primary {
		background-color: var(--accent-color);
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 2rem;
		font-size: 1rem;
		font-weight: 600;
		transition:
			background-color 0.2s,
			transform 0.1s;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--accent-hover);
	}

	.btn-primary:active:not(:disabled) {
		transform: translateY(1px);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

<script lang="ts">
	let cvText = $state('');
	let jdText = $state('');
	let analyzing = $state(false);
	let hasAnalyzed = $state(false);

	function handleAnalyze() {
		if (!cvText.trim() || !jdText.trim()) return;

		analyzing = true;

		// Simulate analysis delay for now
		setTimeout(() => {
			analyzing = false;
			hasAnalyzed = true;
		}, 800);
	}
</script>

<div class="page-container">
	<header class="page-header">
		<h1>Optimize your CV for the job</h1>
		<p>
			Paste your CV and the target job description below to identify missing keywords and areas for
			improvement.
		</p>
	</header>

	<div class="inputs-grid">
		<div class="input-group">
			<label for="cv">Your CV</label>
			<textarea
				id="cv"
				bind:value={cvText}
				placeholder="Paste your full resume text here..."
				spellcheck="false"
			></textarea>
		</div>

		<div class="input-group">
			<label for="jd">Job Description</label>
			<textarea
				id="jd"
				bind:value={jdText}
				placeholder="Paste the job posting requirements here..."
				spellcheck="false"
			></textarea>
		</div>
	</div>

	<div class="actions">
		<button
			class="btn-primary"
			onclick={handleAnalyze}
			disabled={!cvText.trim() || !jdText.trim() || analyzing}
		>
			{#if analyzing}
				Analyzing...
			{:else}
				Analyze Match
			{/if}
		</button>
	</div>

	{#if hasAnalyzed}
		<section class="results-panel" aria-live="polite">
			<h2>Analysis Results</h2>
			<div class="placeholder-content">
				<p>Results will be displayed here. (To be implemented in subsequent specs)</p>
			</div>
		</section>
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
		margin: 0;
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

	.results-panel {
		margin-top: 2rem;
		padding: 2rem;
		background-color: var(--surface-color);
		border: 1px solid var(--border-color);
		border-radius: 12px;
	}

	.results-panel h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
	}

	.placeholder-content {
		color: var(--text-muted);
		text-align: center;
		padding: 2rem;
		border: 1px dashed var(--border-color);
		border-radius: 8px;
	}
</style>

<script lang="ts">
	import { clearAllData } from '$lib/state.svelte';
</script>

<footer class="footer">
	<div class="container">
		<p class="processing-note">All processing is local. Your data never leaves your browser.</p>
		<nav class="links">
			<button class="btn-clear" onclick={clearAllData}>Clear all data</button>
			<a href="/privacy">Privacy Policy</a>
		</nav>
	</div>
</footer>

<style>
	.footer {
		margin-top: auto;
		border-top: 1px solid var(--border-color);
		padding: 1rem;
		background-color: var(--surface-color);
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.container {
		max-width: var(--max-width);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;
	}

	@media (min-width: 640px) {
		.container {
			flex-direction: row;
			justify-content: space-between;
			text-align: left;
		}
	}

	.processing-note {
		margin: 0;
	}

	.links {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	a,
	.btn-clear {
		color: var(--text-muted);
		text-decoration: none;
	}

	.btn-clear {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
	}

	a:hover,
	.btn-clear:hover {
		color: var(--accent-color);
		text-decoration: underline;
	}
</style>

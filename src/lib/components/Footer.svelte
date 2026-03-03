<script lang="ts">
	import { clearAllData } from '$lib/state.svelte';
	import { i18n } from '$lib/i18n.svelte';
</script>

<footer class="footer">
	<div class="container">
		<p class="processing-note">{i18n.t('footer.note')}</p>
		<nav class="links">
			<button class="btn-clear" onclick={clearAllData} type="button">
				{i18n.t('footer.clearBtn')}
			</button>
			<a href="/privacy">{i18n.t('footer.privacyLink')}</a>
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

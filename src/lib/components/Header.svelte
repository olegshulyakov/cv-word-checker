<script lang="ts">
	import { Sun, Moon, Monitor, Github, Globe } from 'lucide-svelte';
	import { themeState } from '$lib/theme.svelte';
</script>

<header>
	<div class="container">
		<a href="/" class="logo">
			<span class="icon">cv</span>
			<span class="text">Word Checker</span>
		</a>

		<div class="actions">
			<!-- Language selector placeholder -->
			<button class="icon-button" aria-label="Language selector" title="Language selector">
				<Globe size={20} />
			</button>

			<button
				class="icon-button"
				onclick={() => themeState.toggle()}
				aria-label="Toggle theme"
				title="Toggle theme (current: {themeState.preference})"
			>
				{#if themeState.preference === 'light'}
					<Sun size={20} />
				{:else if themeState.preference === 'dark'}
					<Moon size={20} />
				{:else}
					<Monitor size={20} />
				{/if}
			</button>

			<a
				href="https://github.com/olegshulyakov/cv-word-checker"
				target="_blank"
				rel="noreferrer"
				class="icon-button"
				aria-label="GitHub repository"
				title="GitHub repository"
			>
				<Github size={20} />
			</a>
		</div>
	</div>
</header>

<style>
	header {
		border-bottom: 1px solid var(--border-color);
		background-color: var(--surface-color);
		padding: 1rem;
	}

	.container {
		max-width: var(--max-width);
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		font-weight: 600;
		color: var(--text-color);
	}

	.logo:hover {
		color: var(--accent-color);
	}

	.logo .icon {
		background-color: var(--accent-color);
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-weight: 800;
		letter-spacing: -0.5px;
	}

	.logo .text {
		display: none;
	}

	@media (min-width: 640px) {
		.logo .text {
			display: inline;
		}
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.icon-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 6px;
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-muted);
		transition: all 0.2s;
	}

	.icon-button:hover {
		color: var(--text-color);
		background-color: var(--surface-hover);
		border-color: var(--border-color);
	}
</style>

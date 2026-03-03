<script lang="ts">
	import { Sun, Moon, Monitor, Github, Globe } from 'lucide-svelte';
	import { themeState } from '$lib/theme.svelte';
	import { i18n, currentLang } from '$lib/i18n.svelte';

	function handleLangChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		i18n.loadLanguage(target.value);
	}
</script>

<header>
	<div class="container">
		<a href="/" class="logo">
			<span class="icon">cv</span>
			<span class="text">{i18n.t('header.title')}</span>
		</a>

		<div class="actions">
			<div class="lang-selector">
				<Globe size={18} class="globe-icon" />
				<select
					value={currentLang.value}
					onchange={handleLangChange}
					aria-label={i18n.t('header.languageSelector')}
					title={i18n.t('header.languageSelector')}
				>
					{#each i18n.supportedLangs as lang (lang.code)}
						<option value={lang.code}>{lang.label}</option>
					{/each}
				</select>
			</div>

			<button
				class="icon-button"
				onclick={() => themeState.toggle()}
				aria-label={i18n.t('header.toggleTheme')}
				title="{i18n.t('header.toggleTheme')} (current: {themeState.preference})"
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
				aria-label={i18n.t('header.githubRepo')}
				title={i18n.t('header.githubRepo')}
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

	.lang-selector {
		display: flex;
		align-items: center;
		position: relative;
		color: var(--text-muted);
	}

	:global(.globe-icon) {
		position: absolute;
		left: 0.5rem;
		pointer-events: none;
	}

	.lang-selector select {
		appearance: none;
		background: transparent;
		border: 1px solid transparent;
		color: var(--text-color);
		padding: 0.25rem 0.5rem 0.25rem 2rem;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		outline: none;
		transition: all 0.2s;
	}

	.lang-selector select:hover,
	.lang-selector select:focus {
		background-color: var(--surface-hover);
		border-color: var(--border-color);
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

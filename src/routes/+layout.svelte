<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { i18n, currentLang } from '$lib/i18n.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(async () => {
		i18n.loadLanguage(currentLang.value);
		try {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({ immediate: true });
		} catch (e) {
			console.warn('PWA service worker registration failed', e);
		}
	});

	// Reactively update the document title based on i18n
	$effect(() => {
		if (i18n.isLoaded && typeof document !== 'undefined') {
			document.title = `CV Word Checker - ${i18n.t('page.title')}`;
			document.documentElement.lang = currentLang.value || 'en';
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if i18n.isLoaded}
	<div class="app-shell">
		<Header />

		<main>
			{@render children()}
		</main>

		<Footer />
	</div>
{:else}
	<div class="app-shell loading-skeleton">
		<div class="spinner"></div>
	</div>
{/if}

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		padding: 2rem 1rem;
		max-width: var(--max-width);
		margin: 0 auto;
		width: 100%;
	}

	.loading-skeleton {
		align-items: center;
		justify-content: center;
		background-color: var(--bg-color);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid var(--border-color);
		border-top-color: var(--accent-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>

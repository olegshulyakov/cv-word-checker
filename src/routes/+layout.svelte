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
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{i18n.t('header.title')}</title>
</svelte:head>

{#if i18n.isLoaded}
	<div class="app-shell">
		<Header />

		<main>
			{@render children()}
		</main>

		<Footer />
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
</style>

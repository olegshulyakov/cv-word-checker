<script lang="ts">
	import { i18n, currentLang } from '$lib/i18n.svelte';
	import { page } from '$app/stores';

	let title = $derived(
		i18n.isLoaded ? `${i18n.t('page.title')} - CV Word Checker` : 'CV Word Checker'
	);
	let description = $derived(i18n.isLoaded ? i18n.t('page.subtitle') : '');
	let url = $derived($page.url.href);

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'CV Word Checker',
		url: url,
		description: description,
		applicationCategory: 'Utility',
		operatingSystem: 'Any'
	});

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.lang = currentLang.value || 'en';
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
		<meta name="twitter:description" content={description} />
	{/if}
	<meta property="og:title" content={title} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={url} />
	<meta property="og:site_name" content="CV Word Checker" />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />

	{#if description}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</sc' + 'ript>'}
	{/if}
</svelte:head>

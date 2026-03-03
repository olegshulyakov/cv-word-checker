import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { i18n } from '$lib/i18n.svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render page title after i18n load', async () => {
		render(Page);

		// Ensure language is loaded (it might be already from layout, but good to be explicit)
		await i18n.loadLanguage('en');

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
		await expect.element(heading).toHaveTextContent('Optimize your CV for the job');
	});
});

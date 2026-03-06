import { describe, expect, it } from 'vitest';
import { i18n } from './i18n.svelte';

describe('i18n dictionary merging', () => {
	it('merges English keyword coverage into non-English locales while preserving translations', async () => {
		i18n.loadLanguage('de');

		expect(i18n.dict).not.toBeNull();
		expect(i18n.dict!.technicalSkillsKeywords).toEqual(
			expect.arrayContaining(['datenwissenschaft', 'react query', 'three.js'])
		);
		expect(i18n.dict!.titleAndDegreeKeywords).toEqual(
			expect.arrayContaining(['frontend entwickler', 'java developer', 'it produktmanager', 'sdet'])
		);
		expect(i18n.dict!.aliases?.['technical product manager']).toBe('it produktmanager');
		expect(i18n.dict!.aliases?.['tanstack query']).toBe('react query');
	});
});

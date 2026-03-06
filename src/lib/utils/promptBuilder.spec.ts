import { describe, expect, it } from 'vitest';
import { i18n } from '../i18n.svelte';
import { getKeywordGaps } from './promptBuilder';

describe('getKeywordGaps', () => {
	it('uses keyword display labels in the generated prompt', () => {
		i18n.loadLanguage('en');

		const gaps = getKeywordGaps({
			technicalSkills: {
				present: [],
				missing: [
					{ term: 'aws', count: 1 },
					{ term: 'react query', count: 1 }
				]
			},
			abilities: {
				present: [],
				missing: [{ term: 'communication', count: 1 }]
			},
			otherKeywords: {
				present: [],
				missing: []
			},
			titleAndDegree: {
				present: [],
				missing: [{ term: 'phd', count: 1 }]
			}
		});

		expect(gaps).toBe('AWS, React Query, Communication, PhD');
	});
});

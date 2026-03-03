import { describe, it, expect } from 'vitest';
import { analyze } from './engine';

describe('engine', () => {
	it('should analyze CV and JD', async () => {
		const cvText = 'I am a React developer. I was responsible for the frontend.';
		const jdText = 'Looking for a React and Svelte developer who is good at frontend.';

		const results = await analyze(cvText, jdText);

		expect(results.match.matchScore).toBeGreaterThan(0);
		expect(results.match.presentKeywords.map((k) => k.term)).toContain('react');
		expect(results.match.missingKeywords.map((k) => k.term)).toContain('svelte');

		expect(results.weakWords.length).toBe(1);
		expect(results.weakWords[0].originalPhrase.toLowerCase()).toBe('responsible for');

		expect(results.analysisTimeMs).toBeGreaterThanOrEqual(0);
	});

	it('should complete within 500ms for large texts', async () => {
		// Create a large text block
		const cvText = 'I am a React developer. I was responsible for the frontend. '.repeat(1000);
		const jdText = 'Looking for a React and Svelte developer who is good at frontend. '.repeat(
			1000
		);

		const results = await analyze(cvText, jdText);
		expect(results.analysisTimeMs).toBeLessThan(500);
	});
});

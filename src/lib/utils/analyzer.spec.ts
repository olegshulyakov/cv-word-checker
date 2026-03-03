import { describe, it, expect } from 'vitest';
import { extractKeywords, matchKeywords } from './analyzer';

describe('Analyzer', () => {
	describe('extractKeywords', () => {
		const stopWords = new Set(['and', 'the', 'to', 'a', 'of', 'in', 'is', 'for', 'with']);

		it('should extract words and filter stop words', () => {
			const text = 'The quick brown fox jumps over the lazy dog and a cat in the hat.';
			const keywords = extractKeywords(text, stopWords);

			const terms = keywords.map((k) => k.term);
			expect(terms).toContain('quick');
			expect(terms).toContain('brown');
			expect(terms).toContain('fox');
			expect(terms).not.toContain('the');
			expect(terms).not.toContain('and');
			expect(terms).not.toContain('a');
		});

		it('should handle basic tech punctuation', () => {
			const text = 'Experience with Node.js, C++, and C#.';
			const keywords = extractKeywords(text, stopWords);

			const terms = keywords.map((k) => k.term);
			expect(terms).toContain('node.js');
			expect(terms).toContain('c++');
			expect(terms).toContain('c#');
			expect(terms).toContain('experience');
		});

		it('should calculate frequency correctly', () => {
			const text = 'React is great. React is fast. I love React.';
			const keywords = extractKeywords(text, stopWords);

			const react = keywords.find((k) => k.term === 'react');
			expect(react?.count).toBe(3);
		});
	});

	describe('matchKeywords', () => {
		const stopWords = new Set(['and', 'the', 'a']);
		const skillsKeywords = new Set(['react', 'typescript', 'css']);

		it('should correctly match keywords and group them', () => {
			const cvText = 'I am a React developer with TypeScript experience.';
			const jdText = 'Looking for a React developer who knows TypeScript, CSS and HTML.';

			const results = matchKeywords(cvText, jdText, stopWords, skillsKeywords);

			const present = results.presentKeywords.map((k) => k.term);
			const missing = results.missingKeywords.map((k) => k.term);

			expect(present).toEqual(expect.arrayContaining(['react', 'developer', 'typescript']));
			expect(missing).toEqual(expect.arrayContaining(['looking', 'who', 'knows', 'css', 'html']));

			expect(results.groups.skills.present.map((k) => k.term)).toEqual(
				expect.arrayContaining(['react', 'typescript'])
			);
			expect(results.groups.skills.missing.map((k) => k.term)).toEqual(
				expect.arrayContaining(['css'])
			);
		});
	});
});

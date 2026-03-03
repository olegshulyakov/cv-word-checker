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
		const technicalSkillsKeywords = new Set(['react', 'css', 'svelte']);
		const abilitiesKeywords = new Set(['leadership']);
		const titleAndDegreeKeywords = new Set(['developer', 'engineer']);

		it('should correctly match keywords and group them', () => {
			const cvText = 'I am a React developer with leadership skills. CSS is cool.';
			const jdText = 'Looking for a React and Svelte engineer with leadership and CSS.';

			const results = matchKeywords(
				cvText,
				jdText,
				stopWords,
				technicalSkillsKeywords,
				abilitiesKeywords,
				titleAndDegreeKeywords
			);

			const present = results.presentKeywords.map((k) => k.term);
			const missing = results.missingKeywords.map((k) => k.term);

			expect(present).toEqual(expect.arrayContaining(['react', 'css', 'leadership']));
			expect(missing).toEqual(expect.arrayContaining(['svelte', 'engineer']));

			expect(results.groups.technicalSkills.present.map((k) => k.term)).toEqual(
				expect.arrayContaining(['react', 'css'])
			);
			expect(results.groups.technicalSkills.missing.map((k) => k.term)).toEqual(
				expect.arrayContaining(['svelte'])
			);

			expect(results.groups.abilities.present.map((k) => k.term)).toEqual(
				expect.arrayContaining(['leadership'])
			);

			expect(results.groups.titleAndDegree.missing.map((k) => k.term)).toEqual(
				expect.arrayContaining(['engineer'])
			);
		});

		it('should match multi-word phrases (TEST-02)', () => {
			const cvText = 'I have experience in machine learning.';
			const jdText = 'machine learning and python.';
			const stopWords = new Set(['and', 'in', 'have']);
			const tech = new Set(['machine learning', 'python']);

			const results = matchKeywords(cvText, jdText, stopWords, tech, new Set(), new Set());

			// console.log('Filtered JD:', results.filteredJdKeywords?.map(k => k.term));
			// Wait, I can't access it easily if it's internal. I'll just log present/missing.
			// console.log('Present:', results.presentKeywords.map(k => k.term));
			// console.log('Missing:', results.missingKeywords.map(k => k.term));

			expect(results.presentKeywords.map((k) => k.term)).toContain('machine learning');
			expect(results.matchScore).toBe(50); // 1 of 2
		});

		it('should prioritize Technical Skills over Abilities (BUG-05)', () => {
			const text = 'leadership';
			const tech = new Set(['leadership']);
			const abilities = new Set(['leadership']);

			const results = matchKeywords(text, text, new Set(), tech, abilities, new Set());

			expect(results.groups.technicalSkills.present.map((k) => k.term)).toContain('leadership');
			expect(results.groups.abilities.present).toHaveLength(0);
		});
	});
});

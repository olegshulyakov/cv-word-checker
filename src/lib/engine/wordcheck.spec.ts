import { describe, it, expect } from 'vitest';
import { findWeakWords } from './wordcheck';

describe('wordcheck', () => {
	const weakWordsDict = {
		'responsible for': ['led', 'managed'],
		helped: ['assisted'],
		various: ['multiple']
	};

	it('should find weak words and return suggestions', () => {
		const text = 'I was responsible for the project and helped the team.';
		const findings = findWeakWords(text, weakWordsDict);

		expect(findings.length).toBe(2);

		expect(findings[0].originalPhrase.toLowerCase()).toBe('responsible for');
		expect(findings[0].suggestions).toEqual(['led', 'managed']);
		expect(findings[0].startIndex).toBe(6);
		expect(findings[0].endIndex).toBe(21);

		expect(findings[1].originalPhrase.toLowerCase()).toBe('helped');
		expect(findings[1].suggestions).toEqual(['assisted']);
		expect(findings[1].startIndex).toBe(38);
		expect(findings[1].endIndex).toBe(44);
	});

	it('should respect word boundaries', () => {
		const text = 'Irresponsible force should not match.';
		const findings = findWeakWords(text, weakWordsDict);
		expect(findings.length).toBe(0);
	});

	it('should handle multiple occurrences', () => {
		const text = 'I helped the team. We helped each other.';
		const findings = findWeakWords(text, weakWordsDict);

		expect(findings.length).toBe(2);
		expect(findings[0].originalPhrase).toBe('helped');
		expect(findings[1].originalPhrase).toBe('helped');
		expect(findings[0].startIndex).not.toBe(findings[1].startIndex);
	});

	it('should preserve original casing', () => {
		const text = 'Responsible for many things.';
		const findings = findWeakWords(text, weakWordsDict);

		expect(findings.length).toBe(1);
		expect(findings[0].originalPhrase).toBe('Responsible for');
	});

	it('should handle overlapping occurrences correctly', () => {
		const text = 'I am responsible for managing the team.';
		const dict = {
			'responsible for': ['led'],
			'responsible for managing': ['directed']
		};
		const findings = findWeakWords(text, dict);
		expect(findings.length).toBe(2);
		expect(findings[0].originalPhrase).toBe('responsible for');
		expect(findings[1].originalPhrase).toBe('responsible for managing');
		expect(findings[0].startIndex).toBe(5);
		expect(findings[1].startIndex).toBe(5);
	});

	describe('Known engine failures (it — expected to fail until fixed)', () => {
		it('BUG-24 — should handle non-Latin word boundaries (TEST-01) without space separation', () => {
			// The `(?<![\p{L}\p{N}])` boundary logic completely breaks on CJK languages
			// because characters are not space-separated, so a preceding Japanese character
			// makes the lookbehind fail.
			const japaneseText = '私は責任がある。新しい技術を助けた。'; // "I am responsible. Helped new tech."
			const dict = {
				責任がある: ['led'],
				助けた: ['assisted']
			};
			const findings = findWeakWords(japaneseText, dict);
			// Currently this fails (returns 0 instead of 2)
			expect(findings.length).toBe(2);
			expect(findings[0].originalPhrase).toBe('責任がある');
			expect(findings[1].originalPhrase).toBe('助けた');
		});

		it('BUG-23 — should bridge across inline HTML tags', () => {
			// The regex uses `[^\p{L}\p{N}]+` to bridge spaces/markdown, but HTML tags
			// contain letters (e.g., 'label'), so it fails to bridge `</label> `.
			const text = 'They were <label>responsible</label> for the release.';
			const findings = findWeakWords(text, weakWordsDict);

			// Currently this fails (returns 0 instead of 1)
			expect(findings.length).toBe(1);
			const expectedPhrase = 'responsible</label> for';
			expect(findings[0].originalPhrase.toLowerCase()).toBe(expectedPhrase);
		});

		it('should find weak phrases separated by multiple spaces or tabs (BUG-20 regression guard)', () => {
			const text = 'I was responsible    \t   for the backend.';
			const findings = findWeakWords(text, weakWordsDict);

			expect(findings.length).toBe(1);
			expect(findings[0].originalPhrase.toLowerCase()).toBe('responsible    \t   for');
			expect(findings[0].startIndex).toBe(6);
			// "responsible    \t   for" is 22 chars long. 6 + 22 = 28
			expect(findings[0].endIndex).toBe(28);
		});

		it('should find weak phrases separated by newlines (BUG-20 regression guard)', () => {
			const text = 'I was highly responsible\nfor the entire project.';
			const findings = findWeakWords(text, weakWordsDict);

			expect(findings.length).toBe(1);
			expect(findings[0].originalPhrase.toLowerCase()).toBe('responsible\nfor');
		});

		it('should find weak phrases interrupted by inline generic markdown formatting (BUG-21 regression guard)', () => {
			const text = 'I was **responsible** for the schema. Also helped_ out _various_ teams.';
			const findings = findWeakWords(text, weakWordsDict);

			// 3 findings: 'responsible** for', 'helped', and 'various'
			expect(findings.length).toBe(3);
			// Note: the regex matches `[^\\p{L}\\p{N}]+` between words, so the bold syntax
			// is captured as part of the original phrase's whitespace gap. But for single-word
			// phrases, the markdown acts purely as a non-word boundary and is not captured.
			expect(findings[0].originalPhrase.toLowerCase()).toBe('responsible** for');
			expect(findings[1].originalPhrase.toLowerCase()).toBe('helped');
			expect(findings[2].originalPhrase.toLowerCase()).toBe('various');
		});
	});

	it('should gracefully handle empty or whitespace-only text', () => {
		expect(findWeakWords('', weakWordsDict).length).toBe(0);
		expect(findWeakWords('   \n\t  ', weakWordsDict).length).toBe(0);
	});
});

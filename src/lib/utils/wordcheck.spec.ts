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

	it('should handle non-Latin word boundaries (TEST-01)', () => {
		const japaneseText = '私は責任がある。新しい技術を助けた。'; // "I am responsible. Helped new tech."
		const dict = {
			責任がある: ['led'],
			助けた: ['assisted']
		};
		const findings = findWeakWords(japaneseText, dict);
		expect(findings.length).toBe(2);
		expect(findings[0].originalPhrase).toBe('責任がある');
		expect(findings[1].originalPhrase).toBe('助けた');
	});
});

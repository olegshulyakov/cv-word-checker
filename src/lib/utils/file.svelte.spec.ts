import { describe, it, expect } from 'vitest';
import { readFileAsText } from './file';

describe('file utility', () => {
	it('should read File object as text', async () => {
		const content = 'hello world';
		const file = new File([content], 'test.txt', { type: 'text/plain' });

		const result = await readFileAsText(file);
		expect(result).toBe(content);
	});

	it('should handle empty files', async () => {
		const file = new File([], 'empty.txt', { type: 'text/plain' });
		const result = await readFileAsText(file);
		expect(result).toBe('');
	});

	it('should read a large text file', async () => {
		const content = 'x'.repeat(100_000);
		const file = new File([content], 'large.txt', { type: 'text/plain' });
		const result = await readFileAsText(file);
		expect(result).toHaveLength(100_000);
		expect(result).toBe(content);
	});

	it('should read a UTF-8 file with non-ASCII characters', async () => {
		const content = 'Héllo Wörld — résumé español';
		const file = new File([content], 'unicode.txt', { type: 'text/plain' });
		const result = await readFileAsText(file);
		expect(result).toBe(content);
	});
});

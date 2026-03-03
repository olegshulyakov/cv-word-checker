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
});

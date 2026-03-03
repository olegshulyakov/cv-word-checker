import { describe, it, expect } from 'vitest';
import { stripHtmlAndMarkdown } from './parser';

describe('stripHtmlAndMarkdown', () => {
	it('should handle empty strings', () => {
		expect(stripHtmlAndMarkdown('')).toBe('');
		expect(stripHtmlAndMarkdown(null as unknown as string)).toBe('');
	});

	it('should strip HTML tags', () => {
		expect(stripHtmlAndMarkdown('<p>Hello <b>World</b></p>')).toBe('Hello World');
		expect(stripHtmlAndMarkdown('<div>Line 1</div><span>Line 2</span>')).toBe('Line 1 Line 2');
	});

	it('should decode basic HTML entities', () => {
		expect(stripHtmlAndMarkdown('Hello&nbsp;World')).toBe('Hello World');
		expect(stripHtmlAndMarkdown('A &amp; B')).toBe('A & B');
		expect(stripHtmlAndMarkdown('1 &lt; 2 &gt; 0')).toBe('1 < 2 > 0');
	});

	it('should strip markdown headers', () => {
		expect(stripHtmlAndMarkdown(`# Header 1\n## Header 2\nText`)).toBe('Header 1 Header 2 Text');
	});

	it('should strip markdown formatting (bold, italic)', () => {
		expect(stripHtmlAndMarkdown('This is **bold** and *italic*')).toBe('This is bold and italic');
		expect(stripHtmlAndMarkdown('This is __bold__ and _italic_')).toBe('This is bold and italic');
	});

	it('should strip markdown links', () => {
		expect(stripHtmlAndMarkdown('Check out [Google](https://google.com) now')).toBe(
			'Check out Google now'
		);
	});

	it('should strip list markers', () => {
		expect(stripHtmlAndMarkdown(`- Item 1\n* Item 2\n+ Item 3`)).toBe('Item 1 Item 2 Item 3');
		expect(stripHtmlAndMarkdown(`1. First\n2. Second\n10. Tenth`)).toBe('First Second Tenth');
	});

	it('should strip blockquotes', () => {
		expect(stripHtmlAndMarkdown(`> Quote line 1\n> Quote line 2`)).toBe(
			'Quote line 1 Quote line 2'
		);
	});

	it('should handle a mix of formatting', () => {
		const input = `
# Developer Resume
## Experience
* **Senior Engineer** at [TechCorp](http://example.com)
> Led the team to success
<div>Built cool <em>stuff</em></div>
		`;
		expect(stripHtmlAndMarkdown(input)).toBe(
			'Developer Resume Experience Senior Engineer at TechCorp Led the team to success Built cool stuff'
		);
	});
});

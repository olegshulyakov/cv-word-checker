export function stripHtmlAndMarkdown(text: string): string {
	if (!text) return '';

	// Remove script and style content
	let parsed = text.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ');

	// Simple HTML strip
	parsed = parsed.replace(/<[^>]+>/g, ' ');

	// Decode some common HTML entities
	parsed = parsed
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');

	// Simple markdown strip (headers, bold, italic, lists, links)
	// Remove blockquotes
	parsed = parsed.replace(/^>\s+/gm, '');
	// Remove list markers
	parsed = parsed.replace(/^[-*+]\s+/gm, '');
	parsed = parsed.replace(/^\d+\.\s+/gm, '');
	// Remove headers
	parsed = parsed.replace(/^#{1,6}\s+/gm, '');
	// Replace links [text](url) -> ' text ' to avoid fusion
	parsed = parsed.replace(/\[([^\]]+)\]\([^)]+\)/g, ' $1 ');
	// Replace bold/italic (catch **, *, __, _) with spaces
	parsed = parsed.replace(/(\*\*|__)(.*?)\1/g, ' $2 ');
	parsed = parsed.replace(/(\*|_)(.*?)\1/g, ' $2 ');

	// Normalize spaces
	return parsed.replace(/\s+/g, ' ').trim();
}

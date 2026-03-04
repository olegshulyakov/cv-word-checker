export type AgentMethod = 'url' | 'clipboard';

export interface AiAgent {
	id: string;
	name: string;
	urlTemplate: string;
	method: AgentMethod;
}

export const aiAgents: AiAgent[] = [
	{
		id: 'chatgpt',
		name: 'ChatGPT',
		urlTemplate: 'https://chatgpt.com/',
		method: 'url'
	},
	{
		id: 'claude',
		name: 'Claude',
		urlTemplate: 'https://claude.ai/new',
		method: 'url'
	},
	{
		id: 'gemini',
		name: 'Gemini',
		urlTemplate: 'https://gemini.google.com/app',
		method: 'url'
	},
	{
		id: 'perplexity',
		name: 'Perplexity',
		urlTemplate: 'https://www.perplexity.ai/',
		method: 'url'
	},
	{
		id: 'deepseek',
		name: 'DeepSeek',
		urlTemplate: 'https://chat.deepseek.com/?q={prompt}',
		method: 'url'
	}
];

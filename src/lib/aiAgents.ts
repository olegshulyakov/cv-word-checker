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
		urlTemplate: 'https://chat.deepseek.com/',
		method: 'url'
	},
	{
		id: 'mistral',
		name: 'Mistral',
		urlTemplate: 'https://chat.mistral.ai/',
		method: 'url'
	},
	{
		id: 'meta',
		name: 'Meta AI',
		urlTemplate: 'https://www.meta.ai/',
		method: 'url'
	},
	{
		id: 'duckduckgo',
		name: 'DuckDuckGo AI',
		urlTemplate: 'https://duck.ai/',
		method: 'url'
	},
	{
		id: 'qwen',
		name: 'Qwen',
		urlTemplate: 'https://chat.qwen.ai/',
		method: 'url'
	},
	{
		id: 'yandex',
		name: 'Yandex AI',
		urlTemplate: 'https://alice.yandex.ru/',
		method: 'url'
	}
];

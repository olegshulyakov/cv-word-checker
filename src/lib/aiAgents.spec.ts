import { describe, it, expect } from 'vitest';
import { aiAgents } from './aiAgents';

describe('aiAgents', () => {
	it('should export an array of AI agents', () => {
		expect(Array.isArray(aiAgents)).toBe(true);
		expect(aiAgents.length).toBeGreaterThan(0);
	});

	it('should have correctly formatted agent objects', () => {
		aiAgents.forEach((agent) => {
			expect(agent).toHaveProperty('id');
			expect(typeof agent.id).toBe('string');

			expect(agent).toHaveProperty('name');
			expect(typeof agent.name).toBe('string');

			expect(agent).toHaveProperty('urlTemplate');
			expect(typeof agent.urlTemplate).toBe('string');
			// expect(agent.urlTemplate).toContain('{prompt}');

			expect(agent).toHaveProperty('method');
			expect(['url', 'clipboard']).toContain(agent.method);
		});
	});
});

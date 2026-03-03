import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeState } from './theme.svelte';

describe('theme module', () => {
	let themeState: ThemeState;

	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
		// Mock matchMedia
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: vi.fn().mockImplementation((query) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(), // Deprecated
				removeListener: vi.fn(), // Deprecated
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			}))
		});
		themeState = new ThemeState();
	});

	it('should initialize with default system theme', () => {
		expect(themeState.preference).toBe('system');
		// Since we mocked matches: false, current should be light
		expect(themeState.current).toBe('light');
	});

	it('should toggle through themes', () => {
		expect(themeState.preference).toBe('system');
		themeState.toggle();
		expect(themeState.preference).toBe('light');
		themeState.toggle();
		expect(themeState.preference).toBe('dark');
		themeState.toggle();
		expect(themeState.preference).toBe('system');
	});

	it('should apply dark theme to document', () => {
		themeState.set('dark');
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
	});

	it('should remove data-theme for light theme', () => {
		themeState.set('dark');
		themeState.set('light');
		expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
	});
});

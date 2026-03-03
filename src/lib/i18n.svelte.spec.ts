import { describe, it, expect, vi, beforeEach } from 'vitest';
import { i18n } from './i18n.svelte';

// Mock dynamic import for locales
vi.mock('./locales/en.json', () => ({
	default: {
		ui: {
			'header.title': 'CV Word Checker',
			'page.analyzeBtn': 'Analyze'
		},
		stopWords: ['the', 'a'],
		weakWords: { 'helped': ['assisted'] },
		technicalSkillsKeywords: ['java'],
		abilitiesKeywords: ['leadership'],
		titleAndDegreeKeywords: ['engineer']
	}
}));

vi.mock('./locales/de.json', () => ({
	default: {
		ui: {
			'header.title': 'Lebenslauf-Check'
		},
		stopWords: ['der', 'die'],
		weakWords: { 'geholfen': ['unterstützt'] },
		technicalSkillsKeywords: ['java'],
		abilitiesKeywords: ['führung'],
		titleAndDegreeKeywords: ['ingenieur']
	}
}));

describe('i18n module', () => {
	beforeEach(() => {
		// Reset state if needed, though svelte state might persist in vitest
	});

	it('should have initial state as not loaded', () => {
		expect(i18n.isLoaded).toBe(false);
	});

	it('should load English locale and translate keys', async () => {
		await i18n.loadLanguage('en');
		expect(i18n.isLoaded).toBe(true);
		expect(i18n.t('header.title')).toBe('CV Word Checker');
	});

	it('should fall back to English for missing keys', async () => {
		await i18n.loadLanguage('de');
		// header.title exists in de
		expect(i18n.t('header.title')).toBe('Lebenslauf-Check');
		// page.analyzeBtn missing in de mock, should fallback to en
		expect(i18n.t('page.analyzeBtn')).toBe('Analyze');
	});

	it('should return the key itself if not found in any locale', () => {
		expect(i18n.t('non.existent.key')).toBe('non.existent.key');
	});
});

import { browser } from '$app/environment';
import { createPersistentState } from './state.svelte';

export type LocaleDict = {
	ui: Record<string, string>;
	stopWords: string[];
	weakWords: Record<string, string[]>;
	technicalSkillsKeywords: string[];
	abilitiesKeywords: string[];
	titleAndDegreeKeywords: string[];
};

export const currentLang = createPersistentState('cvwc_lang', '');

const supportedLangs = [
	{ code: 'en', label: 'English' },
	{ code: 'es', label: 'Español' },
	{ code: 'fr', label: 'Français' },
	{ code: 'de', label: 'Deutsch' },
	{ code: 'pt', label: 'Português' },
	{ code: 'zh', label: '中文' },
	{ code: 'ja', label: '日本語' },
	{ code: 'hi', label: 'हिन्दी' },
	{ code: 'ru', label: 'Русский' }
];

let dictionary = $state<LocaleDict | null>(null);

export const i18n = {
	get dict() {
		return dictionary;
	},
	get isLoaded() {
		return dictionary !== null;
	},
	get supportedLangs() {
		return supportedLangs;
	},
	async loadLanguage(lang: string) {
		if (!lang) {
			if (browser) {
				lang = navigator.language.split('-')[0];
			} else {
				lang = 'en';
			}
		}

		// Fallback to English if language is not supported
		if (!supportedLangs.find((l) => l.code === lang)) {
			lang = 'en';
		}

		try {
			const module = await import(`./locales/${lang}.json`);
			dictionary = module.default;
			currentLang.value = lang;

			if (browser) {
				document.documentElement.lang = lang;
			}
		} catch (e) {
			console.error(`Failed to load language ${lang}`, e);
			// Fallback
			if (lang !== 'en') {
				await this.loadLanguage('en');
			}
		}
	},
	t(key: string): string {
		if (!dictionary) return key;
		return dictionary.ui[key] || key;
	}
};

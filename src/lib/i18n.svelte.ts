import { browser } from '$app/environment';
import { createPersistentState, STORAGE_KEYS } from './state.svelte';

export type LocaleDict = {
	ui: Record<string, string>;
	stopWords: string[];
	weakWords: Record<string, string[]>;
	technicalSkillsKeywords: string[];
	abilitiesKeywords: string[];
	titleAndDegreeKeywords: string[];
};

export const currentLang = createPersistentState(STORAGE_KEYS.LANG, '');

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
let fallbackDict = $state<LocaleDict | null>(null);

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
			// Always ensure English fallback is loaded
			if (!fallbackDict && lang !== 'en') {
				const fallbackModule = await import('./locales/en.json');
				fallbackDict = fallbackModule.default;
			}

			const module = await import(`./locales/${lang}.json`);
			dictionary = module.default;

			// If we just loaded English, it's also our fallback
			if (lang === 'en') {
				fallbackDict = dictionary;
			}

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
		return dictionary.ui[key] || fallbackDict?.ui[key] || key;
	}
};

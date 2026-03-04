import { browser } from '$app/environment';
import { createPersistentState, STORAGE_KEYS } from './state.svelte';

export type LocaleDict = {
	ui: Record<string, string>;
	stopWords: string[];
	weakWords: Record<string, string[]>;
	technicalSkillsKeywords: string[];
	abilitiesKeywords: string[];
	titleAndDegreeKeywords: string[];
	aliases?: Record<string, string>;
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

// All locale files are bundled eagerly at build time — available offline immediately,
// with no runtime network requests needed.
const locales = import.meta.glob('./locales/*.json', { eager: true }) as Record<
	string,
	{ default: LocaleDict }
>;

let dictionary = $state<LocaleDict | null>(null);
let fallbackDict: LocaleDict | null = null;

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
	loadLanguage(lang: string) {
		if (!lang) {
			lang = browser ? navigator.language.split('-')[0] : 'en';
		}

		// Fall back to English if the requested language is not supported
		if (!supportedLangs.find((l) => l.code === lang)) {
			lang = 'en';
		}

		const key = `./locales/${lang}.json`;
		const locale = locales[key];

		if (!locale) {
			console.error(`Locale file not found for "${lang}", falling back to English`);
			if (lang !== 'en') this.loadLanguage('en');
			return;
		}

		dictionary = locale.default;

		// Cache the English locale as the UI-string fallback
		if (lang === 'en') {
			fallbackDict = dictionary;
		} else if (!fallbackDict) {
			const enLocale = locales['./locales/en.json'];
			fallbackDict = enLocale?.default ?? null;
		}

		currentLang.value = lang;

		if (browser) {
			document.documentElement.lang = lang;
		}
	},
	t(key: string): string {
		if (!dictionary) return key;
		return dictionary.ui[key] || fallbackDict?.ui[key] || key;
	}
};

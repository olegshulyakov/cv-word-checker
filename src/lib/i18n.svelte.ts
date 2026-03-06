import { browser } from '$app/environment';
import { SvelteSet } from 'svelte/reactivity';
import { createPersistentState, STORAGE_KEYS } from './state.svelte';

export type LocaleDict = {
	ui: Record<string, string>;
	stopWords: string[];
	weakWords: Record<string, string[]>;
	technicalSkillsKeywords: string[];
	abilitiesKeywords: string[];
	titleAndDegreeKeywords: string[];
	keywordLabels?: Record<string, string>;
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

function uniqueStrings(...lists: (string[] | undefined)[]): string[] {
	const seen = new SvelteSet<string>();
	const merged: string[] = [];

	for (const list of lists) {
		for (const value of list ?? []) {
			if (!seen.has(value)) {
				seen.add(value);
				merged.push(value);
			}
		}
	}

	return merged;
}

function mergeLocaleDict(locale: LocaleDict, fallback: LocaleDict): LocaleDict {
	if (locale === fallback) return fallback;

	return {
		...locale,
		technicalSkillsKeywords: uniqueStrings(
			locale.technicalSkillsKeywords,
			fallback.technicalSkillsKeywords
		),
		abilitiesKeywords: uniqueStrings(locale.abilitiesKeywords, fallback.abilitiesKeywords),
		titleAndDegreeKeywords: uniqueStrings(
			locale.titleAndDegreeKeywords,
			fallback.titleAndDegreeKeywords
		),
		keywordLabels: {
			...(fallback.keywordLabels ?? {}),
			...(locale.keywordLabels ?? {})
		},
		aliases: {
			...(fallback.aliases ?? {}),
			...(locale.aliases ?? {})
		}
	};
}

function sentenceCaseKeyword(term: string, lang: string): string {
	return term.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase(lang));
}

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
		const enLocale = locales['./locales/en.json'];

		if (!locale) {
			console.error(`Locale file not found for "${lang}", falling back to English`);
			if (lang !== 'en') this.loadLanguage('en');
			return;
		}

		// Cache the English locale as the UI-string fallback
		if (lang === 'en') {
			fallbackDict = locale.default;
		} else if (!fallbackDict) {
			fallbackDict = enLocale?.default ?? null;
		}

		dictionary =
			lang === 'en' || !fallbackDict
				? locale.default
				: mergeLocaleDict(locale.default, fallbackDict);

		currentLang.value = lang;

		if (browser) {
			document.documentElement.lang = lang;
		}
	},
	t(key: string): string {
		if (!dictionary) return key;
		return dictionary.ui[key] || fallbackDict?.ui[key] || key;
	},
	keywordLabel(term: string): string {
		const lang = currentLang.value || 'en';

		return (
			dictionary?.keywordLabels?.[term] ??
			fallbackDict?.keywordLabels?.[term] ??
			sentenceCaseKeyword(term, lang)
		);
	}
};

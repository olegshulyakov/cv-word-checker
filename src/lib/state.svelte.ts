import { browser } from '$app/environment';

export function createPersistentState<T>(key: string, initialValue: T) {
	let value = $state(initialValue);

	if (browser) {
		const storedValue = localStorage.getItem(key);
		if (storedValue !== null) {
			try {
				value =
					typeof initialValue === 'string'
						? (storedValue as unknown as T)
						: JSON.parse(storedValue);
			} catch {
				// use initialValue on parse error
			}
		}
	}

	return {
		get value() {
			return value;
		},
		set value(newValue: T) {
			value = newValue;
			if (browser) {
				if (typeof newValue === 'string') {
					localStorage.setItem(key, newValue);
				} else {
					localStorage.setItem(key, JSON.stringify(newValue));
				}
			}
		}
	};
}

export const STORAGE_KEYS = {
	CV: 'cvwc_cv',
	JD: 'cvwc_jd',
	LANG: 'cvwc_lang',
	THEME: 'cvwc_theme',
	AI_AGENT: 'cvwc_ai_agent',
	AI_CUSTOM_URL: 'cvwc_ai_custom_url'
};

export function clearAllData(confirmMessage: string) {
	if (browser) {
		if (!confirm(confirmMessage)) return;

		try {
			Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
			window.location.reload();
		} catch (e) {
			console.error('Failed to clear data:', e);
		}
	}
}

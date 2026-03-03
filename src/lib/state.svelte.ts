import { browser } from '$app/environment';

export function createPersistentState<T>(key: string, initialValue: T) {
	let value = $state(initialValue);

	if (browser) {
		const storedValue = localStorage.getItem(key);
		if (storedValue !== null) {
			try {
				value = typeof initialValue === 'string' ? (storedValue as unknown as T) : JSON.parse(storedValue);
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

export function clearAllData() {
	if (!browser) return;
	const keys = [
		'cvwc_cv',
		'cvwc_jd',
		'cvwc_lang',
		'cvwc_theme',
		'cvwc_ai_agent',
		'cvwc_ai_custom_url'
	];
	keys.forEach((k) => localStorage.removeItem(k));
	window.location.reload();
}

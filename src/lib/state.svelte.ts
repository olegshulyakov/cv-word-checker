import { browser } from '$app/environment';
import { SvelteSet } from 'svelte/reactivity';
import { aiAgents } from './aiAgents';

const persistentRegistry = new SvelteSet<{ reset: () => void }>();

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

	const stateObj = {
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

	persistentRegistry.add({
		reset() {
			value = initialValue;
		}
	});

	return stateObj;
}

export const STORAGE_KEYS = {
	CV: 'cvwc_cv',
	JD: 'cvwc_jd',
	LANG: 'cvwc_lang',
	THEME: 'cvwc_theme',
	AI_AGENT: 'cvwc_ai_agent'
};

export const selectedAgent = createPersistentState(STORAGE_KEYS.AI_AGENT, aiAgents[0].id);

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

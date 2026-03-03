import { browser } from '$app/environment';

export type ThemePreference = 'system' | 'light' | 'dark';

export class ThemeState {
	preference = $state<ThemePreference>('system');
	current = $state<'light' | 'dark'>('light');

	constructor() {
		if (browser) {
			const localTheme = localStorage.getItem('theme') as ThemePreference | null;
			this.preference = localTheme === 'light' || localTheme === 'dark' ? localTheme : 'system';
			this.apply();

			// Listen for system changes
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
				if (this.preference === 'system') {
					this.apply();
				}
			});
		}
	}

	set(theme: ThemePreference) {
		this.preference = theme;
		if (browser) {
			if (theme === 'system') {
				localStorage.removeItem('theme');
			} else {
				localStorage.setItem('theme', theme);
			}
			this.apply();
		}
	}

	apply() {
		if (!browser) return;

		const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		this.current = this.preference === 'system' ? (isDark ? 'dark' : 'light') : this.preference;

		if (this.current === 'dark') {
			document.documentElement.setAttribute('data-theme', 'dark');
		} else {
			document.documentElement.removeAttribute('data-theme');
		}
	}

	toggle() {
		if (this.preference === 'system') {
			this.set('light');
		} else if (this.preference === 'light') {
			this.set('dark');
		} else {
			this.set('system');
		}
	}
}

export const themeState = new ThemeState();

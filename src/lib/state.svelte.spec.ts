import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPersistentState } from './state.svelte';

describe('state module', () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	it('should create persistent state with initial value', () => {
		const state = createPersistentState('test_key', 'initial');
		expect(state.value).toBe('initial');
	});

	it('should load value from localStorage if exists', () => {
		localStorage.setItem('test_key', 'saved_value');
		const state = createPersistentState('test_key', 'initial');
		expect(state.value).toBe('saved_value');
	});

	it('should update localStorage when value changes', () => {
		const state = createPersistentState('test_key', 'initial');
		state.value = 'new_value';
		expect(localStorage.getItem('test_key')).toBe('new_value');
	});

	it('should handle JSON values correctly', () => {
		const initialObj = { a: 1 };
		const state = createPersistentState('json_key', initialObj);
		expect(state.value).toEqual(initialObj);

		const updatedObj = { a: 2 };
		state.value = updatedObj;
		expect(JSON.parse(localStorage.getItem('json_key')!)).toEqual(updatedObj);
	});

	it('should fall back to initialValue when localStorage contains corrupted JSON', () => {
		// Simulates corruption: a value that cannot be JSON.parsed for an object-type state
		localStorage.setItem('corrupt_key', '{not valid json');
		const initial = { x: 42 };
		const state = createPersistentState('corrupt_key', initial);
		// The try/catch in createPersistentState should silently recover to initialValue
		expect(state.value).toEqual(initial);
	});

	it('should use initialValue when the key does not exist in localStorage', () => {
		// Ensure the key is absent
		localStorage.removeItem('missing_key');
		const state = createPersistentState('missing_key', 'default');
		expect(state.value).toBe('default');
	});
});

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

        const newObj = { b: 2 };
        state.value = newObj;
        expect(JSON.parse(localStorage.getItem('json_key')!)).toEqual(newObj);
    });
});

import { useCallback, useState } from 'react';

/**
 * Custom hook for managing boolean toggle state
 * Based on react-bits best practices
 * 
 * @param initialValue - Initial boolean value (default: false)
 * @returns Tuple of [value, toggle, setTrue, setFalse]
 */
export const useToggle = (initialValue: boolean = false): [
    boolean,
    () => void,
    () => void,
    () => void
] => {
    const [value, setValue] = useState<boolean>(initialValue);

    const toggle = useCallback(() => {
        setValue(v => !v);
    }, []);

    const setTrue = useCallback(() => {
        setValue(true);
    }, []);

    const setFalse = useCallback(() => {
        setValue(false);
    }, []);

    return [value, toggle, setTrue, setFalse];
};

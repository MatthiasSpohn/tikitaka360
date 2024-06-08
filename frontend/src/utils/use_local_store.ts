import { useState, useEffect } from "react";

function getStorageValue(key: string, defaultValue: string | null) {
    // getting stored value
    const saved = localStorage.getItem(key);
    if (saved) {
        return JSON.parse(saved);
    }
    return defaultValue;
}

export const useLocalStorage = (key: string, defaultValue: string | null) => {
    const [value, setValue] = useState(() => {
        return getStorageValue(key, defaultValue);
    });

    useEffect(() => {
        // storing input name
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};

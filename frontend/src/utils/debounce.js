// Debounce utility for search and event handlers
// Usage: const debouncedSearch = debounce((query) => search(query), 300)

export function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

export default debounce;

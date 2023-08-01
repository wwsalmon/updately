import { useEffect, useRef } from 'react';

export function useInterval(callback, delay) {
    // From https://overreacted.io/making-setinterval-declarative-with-react-hooks/
    const savedCallback = useRef(callback);

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export function useKey(key, callback) {
    // example usage with a letter: useKey("KeyA", () => alert("hello"));
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    });

    useEffect(() => {
        function handle(event) {
            const tagName = event.target.tagName.toLowerCase();
            if (tagName === 'input' || tagName === 'textarea') {
                // Ignore the event if it originated from an input or textarea
                return;
            }

            if (event.code === key) {
                callbackRef.current(event);
            }
        }

        document.addEventListener("keydown", handle);
        return () => document.removeEventListener("keydown", handle);
    }, [key]);
}
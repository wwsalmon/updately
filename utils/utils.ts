export function dateOnly(date: string): Date {
    const initDate = new Date(date);
    const newDate = new Date(initDate.valueOf() + initDate.getTimezoneOffset() * 60 * 1000);
    return newDate;
}

export function cleanForJSON(input: any): any {
    return JSON.parse(JSON.stringify(input));
}

export const fetcher = url => fetch(url).then(res => res.json());

// from https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function waitForEl(selector: string) {
    const input = document.getElementById(selector);
    if (input) {
        input.focus();
    } else {
        setTimeout(function() {
            waitForEl(selector);
        }, 100);
    }
};
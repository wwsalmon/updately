export function dateOnly(date: string): Date {
    const initDate = new Date(date);
    const newDate = new Date(initDate.valueOf() + initDate.getTimezoneOffset() * 60 * 1000);
    return newDate;
}

export function cleanForJSON(input: any): any {
    return JSON.parse(JSON.stringify(input));
}

export const fetcher = url => fetch(url).then(res => res.json());
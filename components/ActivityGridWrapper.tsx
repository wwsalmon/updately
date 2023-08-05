import { format, subDays, addDays } from 'date-fns';
import ActivityGrid, { ActivityDayMap } from './ActivityGrid';
import { useState } from 'react';

const numCols = 53;

function makeGridArr(arr: { date: string }[], year: string): { gridHashmap: ActivityDayMap, years: string[] } {
    // year: a year string OR "last-year"

    const today = year === "last-year" ? new Date() : new Date(`${year}-12-31`);
    const todayDayOfWeek = today.getDay();
    const todayFirstDayOfWeek = subDays(today, todayDayOfWeek);
    const firstDayOnGraph = subDays(todayFirstDayOfWeek, (numCols - 1) * 7);

    let gridHashmap = {}; // dates to ActivityDay objects.
    let currDay = firstDayOnGraph;
    let week = 0;

    while (currDay <= today) {
        if (year !== "last-year" && currDay.getFullYear() !== parseInt(year)) {
            currDay = addDays(currDay, 1);
            continue;
        }
        gridHashmap[format(currDay, "yyyy-MM-dd")] = {
            date: currDay,
            day: currDay.getDay(),
            week: week,
            count: 0,
        };

        if (currDay.getDay() === 6) week++;
        currDay = addDays(currDay, 1);
    }

    let years = []
    for (let item of arr) {
        const year = format(new Date(item.date), "yyyy");
        if (!years.includes(year)) years.push(year);

        const index = format(new Date(item.date), "yyyy-MM-dd");
        try {
            gridHashmap[index].count += 1;
        } catch (error) {
            // the date isn't in the past year
            continue;
        }
    }

    return { gridHashmap, years };
}

const ActivityGridWrapper = ({ updates }: { updates: { date: string }[] }) => {
    const [year, setYear] = useState<string>("last-year"); // a year string OR "last-year"
    const { gridHashmap, years } = makeGridArr(updates, year);

    return (
        <>
            <div className="flex gap-4 mb-4">
                {/* get the years that the user has written updates and display them as tabs above */}
                {years.map(y => (
                    <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`pb-0.5 border-b-2 text-xs ${((year === "last-year" && y === format(new Date(), "yyyy")) || y === year) ? "border-stone-700 text-stone-700 font-bold" : "text-stone-400 border-transparent"}`}
                    >{y}</button>
                ))}

            </div >
            <ActivityGrid data={gridHashmap} />
        </>
    )
}

export default ActivityGridWrapper

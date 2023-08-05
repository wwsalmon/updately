import { format, subDays, addDays } from 'date-fns';
import ActivityGrid, { ActivityDayMap } from './ActivityGrid';
import { useState } from 'react';
import { User } from '../utils/types';
import classNames from 'classnames';

const numCols = 53;

function makeGridArr(arr: { date: string }[], year: string): { gridHashmap: ActivityDayMap, years: string[], totalCount: number } {
    // year: a year string OR "last-year"

    const today = year === "last-year" ? new Date() : new Date(`${year}-12-31`);
    const todayDayOfWeek = today.getDay();
    const todayFirstDayOfWeek = subDays(today, todayDayOfWeek);
    const firstDayOnGraph = subDays(todayFirstDayOfWeek, (numCols - 1) * 7);

    let gridHashmap: ActivityDayMap = {}; // dates to ActivityDay objects.
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
    let totalCount = 0;
    for (let item of arr) {
        const year = format(new Date(item.date), "yyyy");
        if (!years.includes(year)) years.push(year);

        const index = format(new Date(item.date), "yyyy-MM-dd");
        try {
            gridHashmap[index].count += 1;
            totalCount += 1;
        } catch (error) {
            // the date isn't in the past year
            continue;
        }
    }

    return { gridHashmap, years, totalCount };
}

const Activity = ({ updates, pageUser }: { updates: { date: string }[], pageUser: User}) => {
    const [year, setYear] = useState<string>("last-year"); // a year string OR "last-year"
    const { gridHashmap, years, totalCount } = makeGridArr(updates, year);
    const joinDate = new Date(pageUser.createdAt);
    const joinYear = joinDate.getFullYear();

    return (
        <>
            <div className="overflow-x-auto">
                <div className="flex gap-4 mb-6">
                    <span className="font-bold">
                        Activity
                    </span>
                    <button
                        onClick={() => setYear("last-year")}
                        className={classNames("pb-0.5 border-b-2 whitespace-nowrap", ("last-year" === year) ? "border-stone-700 text-stone-700 font-bold" : "text-stone-400 border-transparent")}
                    >Last year</button>
                    {/* get the years that the user has written updates and display them as tabs above */}
                    {years.map(y => (
                        <button
                            key={y}
                            onClick={() => setYear(y)}
                            className={classNames("pb-0.5 border-b-2", (y === year) ? "border-stone-700 text-stone-700 font-bold" : "text-stone-400 border-transparent")}
                        >{y}</button>
                    ))}
                </div >
            </div>
            <ActivityGrid data={gridHashmap} />
            <div className="text-stone-500 text-sm mt-6">
                {totalCount} updates in {year === "last-year" ? "the past year" : year}{(year === joinYear.toString()) && `. ${pageUser.name} joined Updately on ${format(joinDate, "MMMM d, yyyy")}`}
            </div>
        </>
    )
}

export default Activity

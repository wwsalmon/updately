import { format, subDays, addDays } from 'date-fns';
import ActivityGrid, { ActivityDay } from './ActivityGrid';
import { useState } from 'react';

const numCols = 53;

function makeGridArr(arr: { date: string }[], endDate: Date): { gridArr: ActivityDay[], years: string[] } {
    let years = []

    const today = endDate;
    const todayDayOfWeek = today.getDay();
    const todayFirstDayOfWeek = subDays(today, todayDayOfWeek);
    const firstDayOnGraph = subDays(todayFirstDayOfWeek, (numCols - 1) * 7);

    let gridArr: ActivityDay[] = [];
    let currDay = firstDayOnGraph;
    let week = 0;

    while (currDay <= today) {
        gridArr.push({
            date: currDay,
            day: currDay.getDay(),
            week: week,
            count: 0,
        });

        if (currDay.getDay() === 6) week++;
        currDay = addDays(currDay, 1);
    }

    for (let item of arr) {
        const existingIndex = gridArr.findIndex(d => format(d.date, "yyyy-MM-dd") === format(new Date(item.date), "yyyy-MM-dd"));
        if (existingIndex > -1) gridArr[existingIndex].count += 1;
        else console.log("error, date not found in gridArr")

        const year = format(new Date(item.date), "yyyy");
        if (!years.includes(year)) years.push(year);
    }

    return { gridArr, years };
}

const ActivityGridWrapper = ({ updates }: { updates: { date: string }[] }) => {
    const [year, setYear] = useState<string>("last-year"); // a year string OR "last-year"
    const endDate = year === "last-year" ? new Date() : new Date(`${year}-12-31`);
    const { gridArr, years } = makeGridArr(updates, endDate);

    return (
        <>
            <div className="flex gap-4 mb-4">
                {/* get the years that the user has written updates and display them as tabs above */}
                {years.map(y => (
                    <button
                        key={y}
                        onClick={() => {
                            setYear(y)
                        }}
                        className={`pb-0.5 border-b-2 text-xs ${((year === "last-year" && y === format(new Date(), "yyyy")) || y === year) ? "border-stone-700 text-stone-700 font-bold" : "text-stone-400 border-transparent"}`}
                    >{y}</button>
                ))}

            </div >
            <ActivityGrid data={gridArr} />
        </>
    )
}

export default ActivityGridWrapper
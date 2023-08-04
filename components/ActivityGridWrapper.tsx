import { format } from 'date-fns';
import ActivityGrid, { ActivityDay } from './ActivityGrid';
import { useEffect, useState } from 'react';

function makeGridArr(arr: { date: string }[]) {
    let gridArr: ActivityDay[] = [];
    for (let item of arr) {
        const existingIndex = gridArr.findIndex(d => d.date === format(new Date(item.date), "yyyy-MM-dd"));
        if (existingIndex > -1) gridArr[existingIndex].count += 1;
        else gridArr.push({
            date: format(new Date(item.date), "yyyy-MM-dd"),
            count: 1,
        });
    }
    return gridArr;
}

function getYears(arr: { date: string }[]) {
    let years: string[] = [];
    for (let item of arr) {
        const year = format(new Date(item.date), "yyyy");
        if (!years.includes(year)) years.push(year);
    }
    return years;
}

const ActivityGridWrapper = ({ updates }: { updates: { date: string }[] }) => {
    const [year, setYear] = useState<string>("last-year"); // a year string OR "last-year"
    const endDate = year === "last-year" ? new Date() : new Date(`${year}-12-31`);

    return (
        <>
            <div className="flex gap-4 mb-4">
                {/* get the years that the user has written updates and display them as tabs above */}
                {getYears(updates).map(y => (
                    <button
                        key={y}
                        onClick={() => {
                            setYear(y)
                        }}
                        className={`pb-0.5 border-b-2 text-xs ${((year === "last-year" && y === format(new Date(), "yyyy")) || y === year) ? "border-stone-700 text-stone-700 font-bold" : "text-stone-400 border-transparent"}`}
                    >{y}</button>
                ))}

            </div >
            <ActivityGrid
                data={year === "last-year" ? makeGridArr(updates) : makeGridArr(updates.filter(u => format(new Date(u.date), "yyyy") === year))}
                endDate={endDate}
            />
        </>
    )
}

export default ActivityGridWrapper
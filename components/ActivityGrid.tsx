import { ReactNode, useEffect, useState } from "react";
import { addDays, format, subDays } from "date-fns";

export interface ActivityDay {
    date: string,
    count: number,
}

interface GridDay {
    date: Date,
    day: number,
    week: number,
}

const GridLabel = ({ row, col, children }: { row: number, col: number, children: ReactNode }) => (
    <div
        style={{
            gridRow: row,
            gridColumn: col,
            fontSize: 10,
        }}
        className="text-stone-300 dark:text-stone-700"
    ><span>{children}</span></div>
)

export default function ActivityGrid({ data, label, color, endDate = new Date() }: { data: ActivityDay[], label?: string, color?: string, endDate?: Date }) {
    const [gridDays, setGridDays] = useState<GridDay[]>([]);
    const numCols = 54;

    useEffect(() => {
        const today = endDate;
        const todayDayOfWeek = today.getDay();
        const todayFirstDayOfWeek = subDays(today, todayDayOfWeek);
        const firstDayOnGraph = subDays(todayFirstDayOfWeek, (numCols - 1) * 7);

        let newGridDays: GridDay[] = [];
        let currDay = firstDayOnGraph;
        let week = 0;

        while (currDay <= today) {
            newGridDays.push({
                date: currDay,
                day: currDay.getDay(),
                week: week,
            });

            if (currDay.getDay() === 6) week++;
            currDay = addDays(currDay, 1);
        }

        setGridDays(newGridDays);
    }, [data])

    const monthChangeDays = gridDays.filter((d, i, a) => (
        i === 0 || a[i - 1].date.getMonth() !== d.date.getMonth()
    ));

    const maxCount = Math.max(...data.map(d => d.count));

    return (
        <div
            style={{
                position: "relative",
                display: "grid",
                gridTemplateRows: "repeat(8, 16px)",
                gridTemplateColumns: `24px repeat(${numCols}, 16px)`,
                width: "100%",
                // overflowX: "auto",
            }}
        >
            {monthChangeDays.map(d => (
                <GridLabel row={1} col={d.week + 2} key={format(d.date, "yyyy-MM-dd")}>
                    {format(d.date, "MMM")}
                </GridLabel>
            ))}
            <GridLabel row={3} col={1}>Mon</GridLabel>
            <GridLabel row={5} col={1}>Wed</GridLabel>
            <GridLabel row={7} col={1}>Fri</GridLabel>
            {gridDays.map(d => {
                const thisDataPoint = data.find(x => x.date === format(d.date, "yyyy-MM-dd"));

                return (
                    <div
                        style={{
                            backgroundColor: thisDataPoint ? (color || "#0026ff") : "#000",
                            opacity: thisDataPoint ? thisDataPoint.count / maxCount : 0.05,
                            width: 14,
                            height: 14,
                            gridRow: d.day + 2,
                            gridColumn: d.week + 2,
                            borderRadius: 3,
                        }}
                        key={format(d.date, "yyyy-MM-dd")}
                    />
                );
            })}
        </div>
    );
}
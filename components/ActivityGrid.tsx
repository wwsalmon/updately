import { ReactNode } from "react";
import { format } from "date-fns";

interface ActivityDay {
    date: Date,
    count: number, // number of updates on that day
    day: number, // 0-6 (Sun-Sat)
    week: number, // 0-52
}

export interface ActivityDayMap {
    [key: string]: ActivityDay
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

export default function ActivityGrid({ data, label, color }: { data: ActivityDayMap, label?: string, color?: string }) {
    const numCols = 53;

    const monthChangeDays: ActivityDay[] = Object.values(data).filter((d, i, a) => (i === 0 || a[i - 1].date.getMonth() !== d.date.getMonth()));

    const maxCount = Math.max(...Object.values(data).map(d => d.count));

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
            {Object.keys(data).map(dateString => {
                const dateActivity = data[dateString];
                return (
                    <div
                        style={{
                            backgroundColor: dateActivity.count > 0 ? (color || "#0026ff") : "#000",
                            opacity: dateActivity.count > 0 ? dateActivity.count / maxCount : 0.05,
                            width: 14,
                            height: 14,
                            gridRow: dateActivity.day + 2,
                            gridColumn: dateActivity.week + 2,
                            borderRadius: 3,
                        }}
                        key={format(dateActivity.date, "yyyy-MM-dd")}
                    />
                )
            })}
        </div>
    );
}

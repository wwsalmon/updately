import { ReactNode } from "react";
import { format } from "date-fns";

export interface ActivityDay {
    date: Date,
    count: number,
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

export default function ActivityGrid({ data, label, color }: { data: ActivityDay[], label?: string, color?: string }) {
    const numCols = 53;

    const monthChangeDays = data.filter((d, i, a) => (
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
            {data.map(d => (
                <div
                    style={{
                        backgroundColor: d.count > 0 ? (color || "#0026ff") : "#000",
                        opacity: d.count > 0 ? d.count / maxCount : 0.05,
                        width: 14,
                        height: 14,
                        gridRow: d.day + 2,
                        gridColumn: d.week + 2,
                        borderRadius: 3,
                    }}
                    key={format(d.date, "yyyy-MM-dd")}
                />
            ))}
        </div>
    );
}
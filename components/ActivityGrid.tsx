import classNames from "classnames";
import { format } from "date-fns";
import { Dispatch, ReactNode, SetStateAction } from "react";

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

export default function ActivityGrid({ data, label, color, setDate }: { data: ActivityDayMap, label?: string, color?: string, setDate: Dispatch<SetStateAction<string>> }) {
    const numCols = 53;

    const monthChangeDays: ActivityDay[] = Object.values(data).filter((d, i, a) => (
        i === 0 || a[i - 1].date.getMonth() !== d.date.getMonth()) && d.date.getDate() < 20
    );

    const maxCount = Math.max(...Object.values(data).map(d => d.count));

    return (
        <div
            style={{
                display: "grid",
                gridTemplateRows: "repeat(8, 15px)",
                gridTemplateColumns: `24px repeat(${numCols}, 15px)`,
                width: "100%",
                overflowX: "auto",
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
            {Object.values(data).map(dateActivity => (
                <div
                    style={{
                        opacity: dateActivity.count > 0 ? dateActivity.count / maxCount : 1,
                        gridRow: dateActivity.day + 2,
                        gridColumn: dateActivity.week + 2,
                    }}
                    className={classNames(dateActivity.count > 0 ? "bg-tblue cursor-pointer" : "bg-gray-100", "hover:!opacity-100 w-[13px] h-[13px] rounded-[3px]")}
                    key={format(dateActivity.date, "yyyy-MM-dd")}
                    onClick={() => dateActivity.count > 0 && setDate(format(dateActivity.date, "yyyy-MM-dd"))}
                />
            ))}
        </div>
    );
}

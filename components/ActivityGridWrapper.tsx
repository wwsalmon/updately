import { format } from 'date-fns';
import ActivityGrid, { ActivityDay } from './ActivityGrid';

export function makeGridArr(arr: { date: string }[]) {
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

const ActivityGridWrapper = ({ updates }: { updates: { date: string }[] }) => {
    return (
        <ActivityGrid data={makeGridArr(updates)} />
    )
}

export default ActivityGridWrapper
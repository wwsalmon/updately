import React, {Dispatch, SetStateAction} from "react";
import { NUM_UPDATES_IN_PAGE } from "../utils/utils";

export default function PaginationBar({page, count, label, setPage}: {
    page: number,
    count: number,
    label: string,
    setPage: Dispatch<SetStateAction<number>>,
}) {
    return (
        <>
            <p className="opacity-50 mt-16">
                Showing {label} {(page - 1) * NUM_UPDATES_IN_PAGE + 1}
                -{(page < Math.floor(count / NUM_UPDATES_IN_PAGE)) ? page * NUM_UPDATES_IN_PAGE : count} of {count}
            </p>
            {count > NUM_UPDATES_IN_PAGE && (
                <div className="opacity-50 mt-4">
                    {Array.from({length: Math.ceil(count / NUM_UPDATES_IN_PAGE)}, (x, i) => i + 1).map(d => (
                        <button
                            className={"py-2 px-4 rounded-md mr-2 " + (d === page ? "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-neutral-700" : "")}
                            onClick={() => setPage(d)}
                            disabled={+d === +page}
                            key={d}
                        >{d}</button>
                    ))}
                </div>
            )}
        </>
    );
}
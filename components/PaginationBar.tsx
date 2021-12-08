import React, {Dispatch, SetStateAction} from "react";

export default function PaginationBar({page, count, label, setPage}: {
    page: number,
    count: number,
    label: string,
    setPage: Dispatch<SetStateAction<number>>,
}) {
    return (
        <>
            <p className="opacity-50 mt-16">
                Showing {label} {(page - 1) * 20 + 1}
                -{(page < Math.floor(count / 20)) ? page * 20 : count} of {count}
            </p>
            {count > 20 && (
                <div className="opacity-50 mt-4">
                    {Array.from({length: Math.ceil(count / 20)}, (x, i) => i + 1).map(d => (
                        <button
                            className={"py-2 px-4 rounded-md mr-2 " + (d === page ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-opacity-20" : "")}
                            onClick={() => setPage(d)}
                            disabled={+d === +page}
                        >{d}</button>
                    ))}
                </div>
            )}
        </>
    );
}
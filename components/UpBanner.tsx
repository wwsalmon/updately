import React, {ReactNode} from "react";

export default function UpBanner(props: {children: ReactNode, className?: string}) {
    return (
        // #1e1e1e = "neutral 850"
        <div className={"px-4 py-2 rounded-md border md:flex items-center bg-gray-50 dark:bg-[#1e1e1e] dark:border-neutral-600 " + (props.className || "")}>
            {props.children}
        </div>
    )
}
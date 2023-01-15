import React, {ReactNode} from "react";

export default function UpBanner(props: {children: ReactNode, className?: string}) {
    return (
        <div className={"px-4 py-2 rounded-md border md:flex items-center bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 " + (props.className || "")}>
            {props.children}
        </div>
    )
}
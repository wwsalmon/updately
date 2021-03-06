import React, {ReactNode} from "react";

export default function UpBanner(props: {children: ReactNode, className?: string}) {
    return (
        <div className={"px-4 py-2 rounded-md border md:flex items-center bg-gray-50 dark:bg-gray-900 dark:bg-opacity-20" + (props.className || "")}>
            {props.children}
        </div>
    )
}
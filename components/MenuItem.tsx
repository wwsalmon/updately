import {ReactNode} from "react";

export default function MenuItem({text, nowrap = true, ...props}: {text: string | ReactNode, nowrap?: boolean}) {
    return (
        <div {...props} className={`p-4 w-full text-left ${nowrap ? "whitespace-nowrap" : ""}`}>
            {text}
        </div>
    )
}
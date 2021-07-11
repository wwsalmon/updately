import {ReactNode} from "react";

export default function MenuItem({text, nowrap = true, ...props}: {text: string | ReactNode, nowrap?: boolean}) {
    return (
        <p {...props} className={`p-4 block w-full text-left ${nowrap ? "whitespace-nowrap" : ""}`}>
            {text}
        </p>
    )
}
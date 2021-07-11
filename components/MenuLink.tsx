import Link from "next/link";
import {ReactNode} from "react";

export default function MenuLink({text, href, nowrap = true, ...props}: {text: string | ReactNode, href?: string, nowrap?: boolean}) {
    return href ? (
        <Link href={href} {...props}>
            <a className={`p-4 hover:bg-gray-100 dark:hover:bg-opacity-20 block w-full text-left ${nowrap ? "whitespace-nowrap" : ""}`}>
                {text}
            </a>
        </Link>
    ) : (
        <p {...props} className={`p-4 block w-full text-left ${nowrap ? "whitespace-nowrap" : ""}`}>
            {text}
        </p>
    )
}
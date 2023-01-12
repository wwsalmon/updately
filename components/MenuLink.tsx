import Link from "next/link";
import {ReactNode} from "react";

export default function MenuLink({text, href, icon, nowrap = true, ...props}: {text: string | ReactNode, href: string, icon?: ReactNode, nowrap?: boolean}) {
    return (
        <Link href={href} {...props}>
            <a className={`flex items-center p-4 hover:bg-gray-100 dark:hover:bg-neutral-800 block w-full text-left ${nowrap ? "whitespace-nowrap" : ""}`}>
                {icon && icon} <span className={icon ? "ml-2" : ""}>{text}</span>
            </a>
        </Link>
    )
}
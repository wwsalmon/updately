import React, {ReactNode} from 'react';
import Link from "next/link";

export default function NavbarItem({icon, text, href, selected}: { icon: ReactNode, text: string, href: string, selected: boolean }) {
    return (
        <Link href={href}>
            <a className={`flex items-center px-6 h-full w-full sm:w-auto ${selected ? "border-b-2 border-black dark:border-white" : ""}`}>
                <div className={selected ? "" : "opacity-75"}>
                    {icon}
                </div>
                <div className={`ml-2 ${selected ? "font-bold" : ""}`}>
                    <span>{text}</span>
                </div>
            </a>
        </Link>
    );
}
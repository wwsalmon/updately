import Link from "next/link";

export default function MenuLink({text, href}: {text: string, href: string}) {
    return (
        <Link href={href}>
            <a className="p-4 hover:bg-gray-100 block whitespace-nowrap w-full text-left">
                {text}
            </a>
        </Link>
    )
}
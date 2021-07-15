import { ReactNode } from "react";

export default function MenuButton({text, icon, onClick}: {text: string, icon?: ReactNode, onClick: () => any}) {
    return (
        <button className="flex items-center p-4 hover:bg-gray-100 dark:hover:bg-opacity-20 whitespace-nowrap w-full text-left" onClick={onClick}>
            {icon && icon} <span className={icon ? "ml-2" : ""}>{text}</span>
        </button>
    )
}
import {FaEllipsisV} from "react-icons/fa";
import {ReactNode, useEffect, useRef, useState} from "react";
import short from "short-uuid";

export default function MoreMenu({items, buttonText = <FaEllipsisV/>} : {
    items: {label: string, href?: string, onClick?: () => any}[],
    buttonText?: string | ReactNode
}) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const thisButton = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const moreButtonClickHandler = e => {
            if (thisButton.current !== null) {
                const isNotButton = e.target !== thisButton.current && !(thisButton.current.contains(e.target));
                if (isNotButton) {
                    setIsOpen(false);
                }
            }
        };

        window.addEventListener('click', moreButtonClickHandler);

        return function cleanup(){
            window.removeEventListener("click", moreButtonClickHandler);
        }
    }, []);

    return (
        <div className="relative">
            <button
                className="up-button text"
                onClick={() => setIsOpen(!isOpen)}
                id={short.generate()}
                ref={thisButton}
            >{buttonText}</button>
            {isOpen && (
                <div className="absolute top-0 mt-16 shadow-lg rounded-md z-10 bg-white">
                    {items.map(item => item.href ? (
                        <a className="p-4 hover:bg-gray-100 block" href={item.href}>
                            {item.label}
                        </a>
                    ) : (item.onClick && (
                        <button className="p-4 hover:bg-gray-100" onClick={item.onClick}>
                            {item.label}
                        </button>
                    )))}
                </div>
            )}
        </div>
    )
}
export default function MenuButton({text, onClick}: {text: string, onClick: () => any}) {
    return (
        <button className="p-4 hover:bg-gray-100 dark:hover:bg-opacity-20 whitespace-nowrap w-full text-left" onClick={onClick}>
            {text}
        </button>
    )
}
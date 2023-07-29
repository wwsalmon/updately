import axios from "axios";
import { Dispatch, SetStateAction, useState } from 'react';
import { FiSearch } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import useSWR from "swr";
import {fetcher, waitForEl} from "../utils/utils";
import { DatedObj, Update } from "../utils/types";
import Modal from "./Modal";

const QuickSwitcher = (props: { isOpen: boolean, onRequestClose: () => (any) }) => {
    const [query, setQuery] = useState<string>("");
    const [page, setPage] = useState<number>(0);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const { data } = useSWR<{ data: DatedObj<Update>[], count: number }>(`/api/search?query=${query}&page=${page}`, query.length ? fetcher : async () => []);
    console.log(data)

    const onRequestClose = (x) => {
        props.onRequestClose();
        setQuery("");
        setPage(0);
        setSelectedIndex(0);
    }

    // Height of area of modal that is not scroll
    const heightOfInput = 32 + 24
    // = height + margin-top (mt-6 => 6 * 4)

    return (
        <Modal
            isOpen={props.isOpen}
            setIsOpen={onRequestClose}
            // onRequestClose={onRequestClose}
            className="px-0 flex flex-col overflow-y-hidden"
            wide={true}
        >
            {/* Because I want scrollbar to be snug against border of modal, i can't add padding x or y to the modal directly. */}
            {/* Every direct child of modal has px-4 */}
            {/* Also modal has py-6 so top should have mt-6 and bottom mb-6 */}
            <div className="flex items-center border-gray-100 px-4 mt-6" id="f">
                <FiSearch className="text-gray-400 mr-6" />
                <input
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setPage(0);
                        setSelectedIndex(0);
                    }}
                    id="quick-switcher-input"
                    placeholder="Go to document"
                    className="w-full focus:online-none outline-none py-1 text-gray-500"
                    autoFocus
                    onKeyDown={e => {
                        if (data && data.data && data.data.length) {
                            if (e.key === "ArrowDown") {
                                e.preventDefault()
                                const newSelectedIndex = selectedIndex === (data.data.length - 1) ? 0 : selectedIndex + 1
                                setSelectedIndex(newSelectedIndex)

                                // Scroll to selected element
                                const modal = document.getElementById("quick-switcher-scroll-area")
                                if (newSelectedIndex !== (data.data.length - 1)) {
                                    // Scroll such that the lower edge of the element we want is at the bottom of the modal viewing area
                                    var elmntAfter = document.getElementById(`searched-doc-${newSelectedIndex + 1}`);
                                    modal.scroll(0, elmntAfter.offsetTop - modal.offsetHeight - heightOfInput)
                                } else {
                                    // Is last element
                                    var elmnt = document.getElementById(`searched-doc-${newSelectedIndex}`);
                                    modal.scroll(0, elmnt.offsetTop - heightOfInput)
                                }
                            } else if (e.key === "ArrowUp") {
                                e.preventDefault()
                                const newSelectedIndex = selectedIndex === 0 ? (data.data.length - 1) : (selectedIndex - 1)
                                setSelectedIndex(newSelectedIndex)

                                // Scroll to selected element
                                var elmnt = document.getElementById(`searched-doc-${newSelectedIndex}`);
                                const modal = document.getElementById("quick-switcher-scroll-area")
                                modal.scroll(0, (elmnt.offsetTop - heightOfInput))
                            } else if (e.key === "Enter") {
                                waitForEl(`searched-doc-${selectedIndex}`)
                            }
                        }
                    }}
                />
            </div>
            <hr />
            <div className="flex-grow px-4 pb-6 overflow-y-auto" id="quick-switcher-scroll-area">
                { /* Every outermost element inside this div has px-8 */}
                {(data) ? (data.data && data.data.length) ? (
                    <div className="break-words overflow-hidden flex flex-col">
                        {data.data.map((u, idx) => {

                            let buttonChildren = (
                                <>
                                    {/* @ts-ignore */}
                                    <SearchNameH3 query={query}>{`${u.title || "Unknown update"} ${u.date}`}</SearchNameH3>
                                    <SearchBody update={u} query={query} />
                                </>
                            )
                            let onClick = () => {
                                // TODO
                                // props.setOpenFileId(u._id)
                                onRequestClose(false)
                            }

                            return (
                                <button
                                    key={u._id}
                                    className={("py-2 px-8 text-left") + (idx === selectedIndex ? " bg-gray-100" : "")}
                                    id={`searched-doc-${idx}`}
                                    onClick={onClick}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                >
                                    <div className="w-full">
                                        {buttonChildren}
                                    </div>
                                </button>
                            )
                        })}
                        {/* Pagination bar */}
                        <div className="px-8 flex gap-4 text-sm text-gray-400 mt-6">
                            {data.count > 10 && Array.from(Array(Math.ceil(data.count / 10)).keys()).map(n =>
                                <button onClick={() => {
                                    setPage(n);
                                    setSelectedIndex(0);
                                    waitForEl("quick-switcher-input")
                                }} className="hover:bg-gray-50 disabled:bg-gray-50 rounded-md px-4 py-2" key={n} disabled={n === page}>{n + 1}</button>
                            )}
                        </div>
                        <p className="px-8 text-sm text-gray-400 mt-2 text-right">
                            Showing results {page * 10 + 1}-{(page * 10 + 10) < data.count ? (page * 10 + 10) : data.count} out of {data.count}
                        </p>
                    </div>
                ) : (query.length ? (
                    <p className="text-gray-400 px-8 text-sm mt-2">No documents containing the given query were found.</p>
                ) : <></>) : (
                    <div className="px-8 mt-2"><Skeleton height={32} count={5} className="my-2" /></div>
                )}
            </div>
        </Modal>
    )
}

const includesAQueryWord = (string: string, queryWords: string[]) => {
    for (let word of queryWords) {
        if (string.toLowerCase().includes(word.toLowerCase())) return true
    }
    return false
}

const SearchNameH3 = ({ children, query }: { children: string, query: string }) => {
    const queryWords = query.split(" ")
    const nameWords = children.split(" ")
    const newNameWords = nameWords.map(word => (
        includesAQueryWord(word, queryWords)
            ? <span className="font-bold text-gray-700">{word}</span>
            : <span className="font-semibold text-gray-600">{word}</span>
    ))
    return (
        <h3>{newNameWords.map((element, idx) => (
            idx === 0
                ? <span key={idx}>{element}</span>
                : <span key={idx}> {element}</span>
        ))}</h3>
    )
}

const SearchBody = ({ update, query }: {update: Update, query: string}) => {
    if (!update.body) return;
    // s.body.substr(s.body.indexOf(query) - 50, 100)
    const queryWords = query.split(" ")
    const paragraphsArr = update.body.split(`
`)
    const newParagraphs = paragraphsArr.filter(p => (
        includesAQueryWord(p, queryWords)
    )).map(p => {
        // Some really jank shit for bolding certain words
        const paragraphWords = p.split(" ")
        const newParagraphWords = paragraphWords.map(w => includesAQueryWord(w, queryWords) ? <b className="text-gray-500">{w}</b> : <span>{w}</span>)
        // return newParagraphWords.join(" ")
        return newParagraphWords
    })
    return (
        // newParagraphs.map( (p, idx) => <pre className="whitespace-pre-wrap text-gray-400 text-sm" key={idx}>
        //     {p}
        // </pre>)
        <div className="text-gray-400 text-sm">
            {newParagraphs.map((p, idx) => <p key={idx} className="mb-2">{
                p.map((f, id) => <span key={id}>{f} </span>)
            }</p>)}
        </div>
    )
}


export default QuickSwitcher
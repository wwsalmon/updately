import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import React, {Dispatch, SetStateAction, useEffect, useMemo, useRef, useState} from "react";
import {User} from "../utils/types";
import axios from "axios";
import MentionItem from "./MentionItem";
import Creatable from "react-select/creatable";
import { getCustomStyles } from "./CustomSelect";
import { useTheme } from "next-themes";

function getMentionFromCM(instance) {
    const cursorInfo = instance.getCursor();
    const thisLine = instance.doc.getLine(cursorInfo.line);
    const thisLineToCursor = thisLine.substr(0, cursorInfo.ch);
    const thisLineToCursorSplit = thisLineToCursor.split(" ");
    const lastPhrase = thisLineToCursorSplit[thisLineToCursorSplit.length - 1];
    const isMention = lastPhrase.substr(0, 1) === "@";
    return {isMention: isMention, mentionQuery: lastPhrase.substr(1)};
}

export function setUserListByQuery(setUserList: Dispatch<SetStateAction<User[]>>, query: string, count?: number) {
    if (query === "") return setUserList([]);

    axios.get(`/api/search-user`, {
        params: {
            s: query,
            count: count || 10,
        }
    }).then(res => {
        setUserList(res.data.results);
    }).catch(e => {
        console.log(e);
    });
}

export default function EditUpdate({body, setBody, title, setTitle, date, setDate, tags, setTags, isLoading, onSave, onCancel, confirmText, cancelText, userTags}: {
    body: string,
    setBody: Dispatch<SetStateAction<string>>,
    title: string,
    setTitle: Dispatch<SetStateAction<string>>,
    date: string,
    setDate: Dispatch<SetStateAction<string>>,
    tags: string[],
    setTags: Dispatch<SetStateAction<string[]>>,
    isLoading: boolean,
    onSave: (any) => any,
    onCancel: (any) => any,
    confirmText: string,
    cancelText: string,
    userTags: string[],
}) {
    const editorRef = useRef();
    const [mentionOpen, setMentionOpen] = useState<boolean>(false);
    const [mentionQuery, setMentionQuery] = useState<string>("");
    const [userList, setUserList] = useState<User[]>([]);
    const [userSelectedIndex, setUserSelectedIndex] = useState<number>(0);

    useEffect(() => {
        setUserListByQuery(setUserList, mentionQuery, 5);
        setUserSelectedIndex(0);
    }, [mentionQuery]);

    const events = useMemo(() => ({
        cursorActivity: (instance) => {
            const {isMention, mentionQuery} = getMentionFromCM(instance);
            if (isMention) {
                setMentionOpen(true);
                setMentionQuery(mentionQuery);
            } else {
                setMentionOpen(false);
            }
        },
        keydown: (instance, event) => {
            const {isMention, mentionQuery} = getMentionFromCM(instance);
            if (isMention) {
                if (["Enter", "ArrowDown", "ArrowUp", "Tab"].includes(event.key)) {
                    event.preventDefault();
                    return;
                }
            }
        },
    }), []);

    useEffect(() => {
        if (!editorRef.current) return;
        // @ts-ignore ts things editorRef.current is undefined but it can't be
        const editorEl = editorRef.current.editorEl;
        // @ts-ignore ts things editorRef.current is undefined but it can't be
        const cm = editorRef.current.simpleMde.codemirror;

        const keydownHandler = e => {
            const {isMention, mentionQuery} = getMentionFromCM(cm);
            if (!isMention) return;
            if (!userList.length) return;

            if (["Enter", "Tab"].includes(e.key)) {
                const cursorInfo = cm.getCursor();
                const mentionStart = cursorInfo.ch - mentionQuery.length;
                const selectedUser = userList[userSelectedIndex];
                cm.doc.replaceRange(
                    `[${selectedUser.name}](${selectedUser._id}) `,
                    {line: cursorInfo.line, ch: mentionStart},
                    {line: cursorInfo.line, ch: cursorInfo.ch}
                );
            }

            if (e.key === "ArrowDown") setUserSelectedIndex(Math.min(userSelectedIndex + 1, userList.length - 1));
            if (e.key === "ArrowUp") setUserSelectedIndex(Math.max(0, userSelectedIndex - 1));
        }

        editorEl.addEventListener("keydown", keydownHandler);

        return () => editorEl.removeEventListener("keydown", keydownHandler);
    }, [editorRef.current, mentionOpen, mentionQuery, userSelectedIndex, userList]);
    
	const { theme, setTheme } = useTheme();

    return (
        <>
            <div className="my-8">
                <div className="up-ui-title my-4"><span>Date</span></div>
                <input
                    type="date"
                    className="w-full text-xl h-12"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />
            </div>

            <hr className="my-8"/>

            <div className="md:flex gap-8">
                <div className="my-8 md:my-0 md:w-1/2">
                    <div className="up-ui-title my-4"><span>Title (optional)</span></div>
                    <input
                        type="text"
                        className="w-full text-xl h-12"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Add a title"
                    />
                </div>

                <hr className="my-8 md:hidden" />

                <div className="my-8 md:my-0 md:w-1/2">
                    <div className="up-ui-title mt-4 mb-5"><span>Tags (optional)</span></div>
                    <Creatable options={userTags.map(d => ({ value: d, label: d }))} isMulti={true} isClearable={true} className="z-10 relative"
                        onChange={option => setTags(option.map(d => d.value))} defaultValue={tags.map(d => ({value: d, label: d}))} styles={{...getCustomStyles(theme), multiValueRemove: (styles) => ({...styles, color: "black"})}}/>
                </div>

            </div>

            <hr className="my-8"/>

            <div className="my-8">
                <div className="up-ui-title my-4"><span>Body</span></div>
                <div className="max-w-full relative">
                    <div className="prose content dark:prose-invert">
                        <SimpleMDE
                            ref={editorRef}
                            id="updateEditor"
                            onChange={setBody}
                            value={body}
                            options={{
                                placeholder: "Write your update here...",
                                toolbar: ["bold", "italic", "strikethrough", "|", "heading-1", "heading-2", "heading-3", "|", "link", "quote", "unordered-list", "ordered-list", "|", "guide"]
                            }}
                            events={events}
                        />
                    </div>
                    {mentionOpen && (
                        <div
                            className="fixed z-30 shadow-lg rounded-md py-1 bg-white dark:bg-neutral-900"
                            style={{
                                // @ts-ignore editorRef.current not undefined
                                top: editorRef.current ? editorRef.current.simpleMde.codemirror.cursorCoords(true, "window").top + 24 : 0,
                                // @ts-ignore editorRef.current not undefined
                                left: editorRef.current ? editorRef.current.simpleMde.codemirror.cursorCoords(true, "window").left : 0,
                            }}
                        >
                            {userList.map((user, i) => (
                                <MentionItem
                                    focused={i === userSelectedIndex}
                                    user={user}
                                    key={`mention-list-user-${user._id}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <hr className="my-8"/>

            <div className="my-8 flex -mx-2">
                <div className="relative">
                    <button className="up-button primary mx-2" disabled={!body || isLoading} onClick={onSave}>
                        <span className={isLoading ? "invisible" : ""}>{confirmText}</span>
                    </button>
                    {isLoading && (
                        <div className="up-spinner"/>
                    )}
                </div>
                <button className="up-button text mx-2" disabled={isLoading} onClick={onCancel}>{cancelText}</button>
            </div>
        </>
    )
}
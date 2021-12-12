import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import React, {Dispatch, SetStateAction, useEffect, useMemo, useRef, useState} from "react";

function getMentionFromCM(instance) {
    const cursorInfo = instance.getCursor();
    const thisLine = instance.doc.getLine(cursorInfo.line);
    const thisLineToCursor = thisLine.substr(0, cursorInfo.ch);
    const thisLineToCursorSplit = thisLineToCursor.split(" ");
    const lastPhrase = thisLineToCursorSplit[thisLineToCursorSplit.length - 1];
    const isMention = lastPhrase.substr(0, 1) === "@";
    return {isMention: isMention, mentionQuery: lastPhrase.substr(1)};
}

export default function EditUpdate({body, setBody, title, setTitle, date, setDate, isLoading, onSave, onCancel, confirmText}: {
    body: string,
    setBody: Dispatch<SetStateAction<string>>,
    title: string,
    setTitle: Dispatch<SetStateAction<string>>,
    date: string,
    setDate: Dispatch<SetStateAction<string>>,
    isLoading: boolean,
    onSave: (any) => any,
    onCancel: (any) => any,
    confirmText: string,
}) {
    const editorRef = useRef();
    const [mentionOpen, setMentionOpen] = useState<boolean>(false);
    const [mentionQuery, setMentionQuery] = useState<string>("");

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

            <div className="my-8">
                <div className="up-ui-title my-4"><span>Title (optional)</span></div>
                <input
                    type="text"
                    className="w-full text-xl h-12"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Add a title"
                />
            </div>

            <hr className="my-8"/>

            <div className="my-8">
                <div className="up-ui-title my-4"><span>Body</span></div>
                <div className="prose content max-w-full">
                    <SimpleMDE
                        ref={editorRef}
                        id="helloworld"
                        onChange={setBody}
                        value={body}
                        options={{
                            placeholder: "Write your update here...",
                            toolbar: ["bold", "italic", "strikethrough", "|", "heading-1", "heading-2", "heading-3", "|", "link", "quote", "unordered-list", "ordered-list", "|", "guide"]
                        }}
                        events={events}
                    />
                    {mentionOpen && (
                        <div className="fixed top-0 left-0 z-30 shadow-lg rounded-md p-4">
                            {mentionQuery}
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
                <button className="up-button text mx-2" disabled={isLoading} onClick={onCancel}>Cancel</button>
            </div>
        </>
    )
}
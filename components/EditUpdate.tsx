import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import React, {Dispatch, SetStateAction} from "react";

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
                        id="helloworld"
                        onChange={setBody}
                        value={body}
                        options={{
                            spellChecker: false,
                            placeholder: "Write your update here..."
                        }}
                    />
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
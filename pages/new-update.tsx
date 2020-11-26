import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import React, {useState} from "react";
import { format } from "date-fns";
import axios from "axios";
import {useRouter} from "next/router";

export default function NewUpdate(){
    const router = useRouter();

    const [body, setBody] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [postLoading, setPostLoading] = useState<boolean>(false);

    function handlePost() {
        setPostLoading(true);

        axios.post("/api/new-update", {
            date: date,
            body: body,
            title: title,
        }).then(res => {
            console.log(res);
            router.push("/");
        }).catch(e => {
            console.log(e);
            setPostLoading(false);
        })
    }

    return (
        <div className="max-w-4xl mx-auto px-4">
            <h1 className="up-h1">New update</h1>

            <div className="my-8">
                <div className="up-overline my-4"><span>Date</span></div>
                <input
                    type="date"
                    className="w-full text-xl h-12"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />
            </div>

            <hr className="my-8"/>

            <div className="my-8">
                <div className="up-overline my-4"><span>Title (optional)</span></div>
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
                <div className="up-overline my-4"><span>Body</span></div>
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
                    <button className="up-button primary mx-2" disabled={!body || postLoading} onClick={handlePost}>
                        <span className={postLoading ? "invisible" : ""}>Post update</span>
                    </button>
                    {postLoading && (
                        <div className="up-spinner"/>
                    )}
                </div>
                <button className="up-button text mx-2">Cancel</button>
            </div>

        </div>
    )
}
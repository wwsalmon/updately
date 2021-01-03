import React from 'react';
import {User} from "../utils/types";
import useSWR from "swr";
import {fetcher} from "../utils/utils";

export default function UpdateComments({updateId, userData}: { updateId: string, userData: User }) {
    const {data, error} = useSWR(`/api/get-comments?updateId=${updateId}`, fetcher);

    return (
        <>
            <div className="up-ui-title"><span>Comments {data ? `(${data.data.length})` : ""}</span></div>
        </>
    );
}
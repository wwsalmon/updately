import React from 'react';
import Link from "next/link";

export default function RemoveFollowerButton({isFollowing, isRequesting, isLoading, isLoggedIn, onClick, primary = false}: {
    isFollowing: boolean,
    isRequesting: boolean,
    isLoading: boolean,
    isLoggedIn: boolean,
    onClick: () => any,
    primary?: boolean,
}) {
    return (
        <>
            <button className="up-button small text" onClick={onClick}>
                <span className={isLoading ? "invisible" : ""}>Remove</span>
            </button>
        </>
    );
}
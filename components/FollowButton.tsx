import React from 'react';
import Link from "next/link";

export default function FollowButton({isFollowing, isRequesting, isLoading, isLoggedIn, onClick, primary = false}: {
    isFollowing: boolean,
    isRequesting: boolean,
    isLoading: boolean,
    isLoggedIn: boolean,
    onClick: () => any,
    primary?: boolean,
}) {
    return (
        <>
            {isLoggedIn ? (
                <div className="relative">
                    {(isFollowing || isRequesting) ? (
                        <button className="up-button small text" onClick={onClick}>
                            <span className={isLoading ? "invisible" : ""}>{isFollowing ? "Following" : "Requested"}</span>
                        </button>
                    ) : (
                        <button className={`up-button small ${primary ? "primary" : ""}`} onClick={onClick}>
                            <span className={isLoading ? "invisible" : ""}>Follow</span>
                        </button>
                    )}
                    {isLoading && (
                        <div className="up-spinner dark"/>
                    )}
                </div>
            ) : (
                <Link href="/sign-in"><a className="up-button small">Follow</a></Link>
            )}
        </>
    );
}
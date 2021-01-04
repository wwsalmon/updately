import React from 'react';
import Link from "next/link";

export default function FollowButton({isFollowing, isLoading, isLoggedIn, onClick, primary = false}: {
    isFollowing: boolean,
    isLoading: boolean,
    isLoggedIn: boolean,
    onClick: () => any,
    primary?: boolean,
}) {
    return (
        <>
            {isLoggedIn ? (
                <div className="relative">
                    {isFollowing ? (
                        <button className="up-button text" onClick={onClick}>
                            <span className={isLoading ? "invisible" : ""}>Following</span>
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
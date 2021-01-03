import React from 'react';
import {FaCaretDown, FaGoogle, FaSearch} from "react-icons/fa";
import {signIn, signOut, useSession} from "next-auth/client";
import Link from "next/link";
import MenuButton from "./MenuButton";
import useSWR from "swr";
import MenuLink from "./MenuLink";
import {User} from "../utils/types";

const fetcher = url => fetch(url).then(res => res.json());

export default function Navbar({}: {  }) {
    const [session, loading] = useSession();
    const { data, error } = session ? useSWR("/api/get-curr-user", fetcher) : { data: null, error: null };

    return (
        <div className="w-full bg-white sticky mb-8 top-0 z-20">
            <div className="max-w-7xl mx-auto h-16 flex items-center px-4">
                <Link href="/"><a><img src="/logo.svg" className="h-12"/></a></Link>
                <div className="ml-auto flex items-center">
                    <Link href="/search">
                        <a className="mr-6">
                            <FaSearch/>
                        </a>
                    </Link>
                    {session ? (
                        <div className="relative up-hover-button">
                            <div className="flex items-center">
                                <FaCaretDown/>
                                <img
                                    src={session.user.image}
                                    alt={`Profile picture of ${session.user.name}`}
                                    className="w-10 h-10 ml-2 rounded-full"
                                />
                            </div>
                            <div className="up-hover-dropdown absolute top-0 mt-10 shadow-lg rounded-md z-10 bg-white">
                                <MenuButton text="Sign out" onClick={signOut}/>
                                {data && (
                                    <MenuLink text="Profile" href={`/@${data.data.urlName}`}/>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button
                            className="up-button primary"
                            onClick={() => signIn('google')}
                        >
                            <div className="flex items-center">
                                <FaGoogle/><span className="ml-2">Sign in</span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
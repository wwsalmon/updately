import React from 'react';
import {FaCaretDown, FaGoogle} from "react-icons/fa";
import {signIn, signOut, useSession} from "next-auth/client";
import Link from "next/link";
import MenuButton from "./MenuButton";
import MenuLink from "./MenuLink";

export default function Navbar({}: {  }) {
    const [session, loading] = useSession();

    return (
        <div className="w-full bg-white sticky mb-8 top-0 z-20">
            <div className="max-w-7xl mx-auto h-16 flex items-center px-4">
                <Link href="/"><a><img src="/logo.svg" className="h-12"/></a></Link>
                <div className="ml-auto">
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
                                <MenuLink text="My profile" href=""/>
                                <MenuButton text="Sign out" onClick={signOut}/>
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
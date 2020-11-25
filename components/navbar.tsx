import React from 'react';
import {FaGoogle} from "react-icons/fa";
import {useSession} from "next-auth/client";
import {signIn, signOut} from 'next-auth/client';
import Link from "next/link";

export default function Navbar({}: {  }) {
    const [session, loading] = useSession();

    return (
        <div className="w-full bg-white sticky mb-8 top-0 z-10">
            <div className="max-w-7xl mx-auto h-16 flex items-center px-4">
                <Link href="/"><a><img src="/logo.svg" className="h-12"/></a></Link>
                <div className="max-w-2xl w-full mx-auto hidden lg:block">
                    <input type="text" placeholder="Search" className="border-2 h-12 px-5 rounded-md w-full"/>
                </div>
                <div className="ml-auto">
                    {session ? (
                        <div className="flex items-center">
                            <button
                                className="font-semibold"
                                onClick={signOut}
                            >
                                Sign out
                            </button>
                            <img src={session.user.image} className="w-10 h-10 ml-4 rounded-full"/>
                        </div>
                    ) : (
                        <button
                            className="h-12 px-5 border-2 border-black hover:bg-black hover:text-white rounded-md transition"
                            onClick={() => signIn('google')}
                        >
                            <div className="flex items-center">
                                <FaGoogle/><span className="ml-2 font-semibold">Sign in</span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
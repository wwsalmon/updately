import React, {ReactNode} from 'react';
import {FaGoogle, FaMoon} from "react-icons/fa";
import {signIn, signOut, useSession} from "next-auth/client";
import Link from "next/link";
import MenuButton from "./MenuButton";
import useSWR from "swr";
import MenuLink from "./MenuLink";
import {useRouter} from "next/router";
import NavbarItem from "./NavbarItem";
import {FiBell, FiChevronDown, FiHome, FiSearch, FiUser} from "react-icons/fi";
import {fetcher} from "../utils/utils";
import {Update, User, Notification} from "../utils/types";
import {format, formatDistanceToNow} from "date-fns";

import {useTheme} from 'next-themes'

export default function Navbar() {
    const router = useRouter();
    const [session, loading] = useSession();
    const { data, error } = useSWR(session ? "/api/get-curr-user" : null, fetcher) || {data: null, error: null};
    const { data: notificationsData, error: notificationsError } = useSWR(session ? "/api/get-notifications" : null, fetcher) || {data: null, error: null};
    const numNotifications = (notificationsData && notificationsData.notifications) ? notificationsData.notifications.filter(d => !d.read).length : 0

    
    const {theme, setTheme} = useTheme();

    return (
        <>
            <div className="w-full bg-white sticky mb-8 top-0 z-30 dark:bg-black">
                <div className="max-w-7xl mx-auto h-16 flex items-center px-4">
                    <Link href="/"><a><img src="/logo.svg" className="h-12"/></a></Link>
                    <div className="flex h-16 bg-white fixed bottom-0 left-0 w-full sm:ml-8 sm:w-auto sm:relative sm:h-full dark:bg-black">
                        {session && (
                            <NavbarItem icon={<FiHome/>} text="Feed" href="/" selected={router.route === "/"}/>
                        )}
                        <NavbarItem icon={<FiSearch/>} text="Explore" href="/explore" selected={router.route === "/explore"}/>
                        {data && data.data && (
                            <NavbarItem icon={<FiUser/>} text="Profile" href={`/@${data.data.urlName}`} selected={router.asPath === `/@${data.data.urlName}`}/>
                        )}
                    </div>
                    <div className="ml-auto flex items-center">
                        <button
                            className="up-button text small ml-2"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            <div className="flex items-center">
                                <FaMoon/>
                            </div>
                        </button>
                        {session ? (
                            <>
                                <Link href="/new-update"><a className="up-button small primary mr-4 hidden sm:block">Post new update</a></Link>
                                {notificationsData && notificationsData.notifications && (
                                    <button className="mr-4 px-2 h-10 relative up-hover-button">
                                        <FiBell/>
                                        {notificationsData.notifications.length > 0 && (
                                            <>
                                                {numNotifications > 0 && (
                                                    <div className="rounded-full w-3 h-3 bg-red-500 top-0 right-0 absolute text-white font-bold">
                                                        <span style={{fontSize: 8, top: -9}} className="relative">{numNotifications}</span>
                                                    </div>
                                                )}
                                                <div className="up-hover-dropdown mt-10 w-64 overflow-y-scroll max-h-96">
                                                    {notificationsData.notifications
                                                        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                                                        .map((notification: Notification) => {
                                                            const thisUpdate: Update = notification.type === "follow" ? null : notificationsData.updates.find(d => d._id === notification.updateId);
                                                            const thisUpdateUser: User = notification.type === "follow" ? null : notificationsData.updateUsers.find(d => d._id === thisUpdate.userId);
                                                            const thisAuthor: User = notificationsData.users.find(d => d._id === notification.authorId);

                                                            return (
                                                                <div key={notification._id} className={notification.read ? "opacity-50" : ""}>
                                                                    <MenuLink
                                                                        text={function(){
                                                                            if (notification.type === "comment") {
                                                                                return (
                                                                                    <>
                                                                            <span>
                                                                                <b>{thisAuthor.name}</b> commented on your {format(new Date(thisUpdate.date), "M/d/yy")} update
                                                                            </span>
                                                                                        <br/>
                                                                                        <span className="opacity-50">
                                                                                {formatDistanceToNow(new Date(notification.createdAt))} ago
                                                                            </span>
                                                                                    </>
                                                                                )
                                                                            }
                                                                            if (notification.type === "reply") {
                                                                                return (
                                                                                    <>
                                                                            <span>
                                                                                <b>{thisAuthor.name}</b> replied to your comment on
                                                                                {" " + (thisUpdateUser.email === session.user.email ?
                                                                                        "your" :
                                                                                        thisUpdateUser._id === thisAuthor._id ?
                                                                                            "their" :
                                                                                            thisUpdateUser.name + "'s"
                                                                                ) + " "}
                                                                                {format(new Date(thisUpdate.date), "M/d/yy")} update
                                                                            </span>
                                                                                    <br/>
                                                                                    <span className="opacity-50">
                                                                                {formatDistanceToNow(new Date(notification.createdAt))} ago
                                                                            </span>
                                                                                </>
                                                                                )
                                                                            }
                                                                            if (notification.type === "follow") {
                                                                                return (
                                                                                    <>
                                                                                        <span><b>{thisAuthor.name}</b> followed you</span>
                                                                                        <br/>
                                                                                        <span className="opacity-50">
                                                                                            {formatDistanceToNow(new Date(notification.createdAt))} ago
                                                                                        </span>
                                                                                    </>
                                                                                )
                                                                            }
                                                                        }()}
                                                                        href={notification.type === "follow" ?
                                                                            `/@${thisAuthor.urlName}?notification=${notification._id}`
                                                                            :
                                                                            `/@${thisUpdateUser.urlName}/${thisUpdate.url}?notification=${notification._id}`
                                                                        }
                                                                        nowrap={false}
                                                                    />
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </>
                                        )}
                                    </button>
                                )}
                                <button className="relative up-hover-button">
                                    <div className="flex items-center">
                                        <FiChevronDown/>
                                        <img
                                            src={session.user.image}
                                            alt={`Profile picture of ${session.user.name}`}
                                            className="w-10 h-10 ml-2 rounded-full"
                                        />
                                    </div>
                                    <div className="up-hover-dropdown mt-10">
                                        {data && data.data && (
                                            <MenuLink text="Profile" href={`/@${data.data.urlName}`}/>
                                        )}
                                        <MenuButton text="Sign out" onClick={signOut}/>
                                    </div>
                                </button>
                            </>
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
        </>
    );
}
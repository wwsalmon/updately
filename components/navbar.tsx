import {FaGoogle} from "react-icons/fa";
import {signIn, signOut, useSession} from "next-auth/client";
import Link from "next/link";
import MenuButton from "./MenuButton";
import MoreMenu from "./MoreMenu";
import useSWR from "swr";
import MenuLink from "./MenuLink";
import {useRouter} from "next/router";
import NavbarItem from "./NavbarItem";
import {FiBell, FiChevronDown, FiHome, FiMoon, FiSearch, FiUser} from "react-icons/fi";
import {fetcher} from "../utils/utils";
import {Update, User, Notification} from "../utils/types";
import {format, formatDistanceToNow} from "date-fns";
import {useTheme} from 'next-themes'
import Axios from "axios";
import { useState } from "react";
import {IoMdExit} from "react-icons/io";

export default function Navbar() {
    const router = useRouter();
    const [session, loading] = useSession();
    const [iter, setIter] = useState<number>(0);
    const { data, error } = useSWR(session ? "/api/get-curr-user-with-follower-ids" : null, fetcher) || {data: null, error: null};
    const { data: notificationsData, error: notificationsError } = useSWR(session ? `/api/get-notifications?iter=${iter}` : null, fetcher) || {data: null, error: null};
    const numNotifications = (notificationsData && notificationsData.notifications) ? notificationsData.notifications.filter(d => !d.read).length : 0
    const [notificationsIsOpen, setNotificationsIsOpen] = useState<boolean>(false); 

    const {theme, setTheme} = useTheme();

    const acceptRequest = (notificationId) => {
        // setIsLoading(true);
        Axios.post("/api/accept-request", {
            notificationId: notificationId
        }).then(res => {
            setIter(iter + 1);
            setNotificationsIsOpen(true);
            // setNotificationsData(res.data.notificationData);
        }).catch(e => {
            console.log(e);
            // setIsLoading(false);
        })
    }

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
                        {session ? (
                            <>
                                <Link href="/new-update"><a className="up-button small primary mr-4 hidden sm:block">Post new update</a></Link>
                                {notificationsData && notificationsData.notifications && (
                                    <>
                                    <MoreMenu
                                        buttonText = {
                                            <>
                                            <FiBell/>
                                            {notificationsData.notifications.length > 0 && (
                                                <>
                                                    {numNotifications > 0 && (
                                                        <div className="rounded-full w-3 h-3 bg-red-500 top-2 right-2 absolute text-white font-bold">
                                                            <span style={{fontSize: 8, top: -9}} className="relative">{numNotifications}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            </>}
                                        className = "my-4 relative"
                                        isOpen1={notificationsIsOpen}
                                    >                             
                                        {notificationsData.notifications.length > 0 && (
                                            <>
                                                <div className="absolute top-0 mt-10 right-0 z-40 shadow-lg rounded-md bg-white dark:bg-black w-64 md:w-96 overflow-y-auto max-h-96">
                                                    {notificationsData.notifications
                                                        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                                                        .map((notification: Notification) => {
                                                            const thisUpdate: Update = (notification.type === "follow" || notification.type === "request") ? null : notificationsData.updates.find(d => d._id === notification.updateId);
                                                            const thisUpdateUser: User = (notification.type === "follow" || notification.type === "request" ) ? null : notificationsData.updateUsers.find(d => d._id === thisUpdate.userId);
                                                            const thisAuthor: User = notificationsData.users.find(d => d._id === notification.authorId);
                                                            
                                                            const href: string = (notification.type === "follow" || notification.type === "request") 
                                                                ? 
                                                                `/@${thisAuthor.urlName}?notification=${notification._id}`
                                                                : 
                                                                `/@${thisUpdateUser.urlName}/${thisUpdate.url}?notification=${notification._id}`;
                                                            

                                                            return (
                                                                <div key={notification._id} className={(notification.read && notification.type !== "request") ? "opacity-50" : ""}>
                                                                    <MenuLink
                                                                        text={function(){
                                                                            if (notification.type === "comment") {
                                                                                return (
                                                                                    <>
                                                                            <span>
                                                                                <Link href={href}><a><b>{thisAuthor.name}</b> commented on your {format(new Date(thisUpdate.date), "M/d/yy")} update</a></Link>
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
                                                                                <Link href={href}><a><b>{thisAuthor.name}</b> replied to your comment on
                                                                                {" " + (thisUpdateUser.email === session.user.email ?
                                                                                        "your" :
                                                                                        thisUpdateUser._id === thisAuthor._id ?
                                                                                            "their" :
                                                                                            thisUpdateUser.name + "'s"
                                                                                ) + " "}
                                                                                {format(new Date(thisUpdate.date), "M/d/yy")} update</a></Link>
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
                                                                                        <span><b><Link href={href}><a>{thisAuthor.name}</a></Link></b> followed you</span>
                                                                                        <br/>
                                                                                        <span className="opacity-50">
                                                                                            {formatDistanceToNow(new Date(notification.updatedAt))} ago
                                                                                        </span>
                                                                                    </>
                                                                                )
                                                                            }
                                                                            if (notification.type === "request") {
                                                                                const isAccepted: boolean = data.data.followerIds.includes(notification.authorId);
                                                                                return (
                                                                                    <>
                                                                                        <div className="flex flex-row items-center gap-4">
                                                                                            <div>
                                                                                                <span><b><Link href={href}><a>{thisAuthor.name}</a></Link></b> requested to follow you</span>
                                                                                                <br/>
                                                                                                <span className="opacity-50">
                                                                                                    {formatDistanceToNow(new Date(notification.createdAt))} ago
                                                                                                </span>
                                                                                            </div>
                                                                                            {isAccepted ? <span>Accepted</span> : <button className="up-button small primary" onClick={() => acceptRequest(notification._id)}>Accept</button>}

                                                                                        </div>
                                                                                    </>
                                                                                )
                                                                            }
                                                                        }()}
                                                                        nowrap={false}
                                                                    />
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </>
                                        )}
                                    </MoreMenu>
                                    </>
                                )}
                                <button className="relative up-hover-button ml-4">
                                    <div className="flex items-center">
                                        <FiChevronDown/>
                                        <img
                                            src={session.user.image}
                                            alt={`Profile picture of ${session.user.name}`}
                                            className="w-10 h-10 ml-2 rounded-full"
                                        />
                                    </div>
                                    <div className="up-hover-dropdown mt-10">
                                        <MenuButton icon={<FiMoon/>} text={`Theme: ${theme}`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}/>
                                        {data && data.data && (
                                            <MenuLink icon={<FiUser />} text="Profile" href={`/@${data.data.urlName}`}/>
                                        )}
                                        <MenuButton icon={<IoMdExit />} text="Sign out" onClick={signOut}/>
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
import {FaGoogle} from "react-icons/fa";
import {signIn, signOut, useSession} from "next-auth/client";
import Link from "next/link";
import MenuButton from "./MenuButton";
import useSWR, {responseInterface} from "swr";
import MenuLink from "./MenuLink";
import {useRouter} from "next/router";
import NavbarItem from "./NavbarItem";
import {FiBell, FiChevronDown, FiHome, FiMoon, FiSearch, FiUser} from "react-icons/fi";
import {fetcher} from "../utils/utils";
import {RichNotif} from "../utils/types";
import {useTheme} from "next-themes";
import axios from "axios";
import {useEffect, useState} from "react";
import {IoMdExit} from "react-icons/io";
import NotificationItem from "./NotificationItem";

export default function Navbar() {
    const router = useRouter();
    const [session, loading] = useSession();
    const { data, error } = useSWR(session ? "/api/get-curr-user" : null, fetcher) || {data: null, error: null};
    const [notificationsIter, setNotificationsIter] = useState<number>(0);
    const { data: notificationData, error: notificationsError }: responseInterface<{ notifications: RichNotif[] }, any> = useSWR(session ? `/api/get-notifications?iter=${notificationsIter}` : null, fetcher);
    const [ notifications, setNotifications ] = useState<RichNotif[]>([]);
    const numNotifications = notifications.filter(d => !d.read).length

    useEffect(() => {
        if (notificationData && notificationData.notifications) setNotifications(notificationData.notifications)
    }, [notificationData]);

    useEffect(() => {
        setNotificationsIter(notificationsIter + 1);
    }, [router.asPath]);

    const {theme, setTheme} = useTheme();

    const acceptRequest = (notificationId) => {
        // setIsLoading(true);
        axios.post("/api/accept-request", {
            notificationId: notificationId
        }).then(res => {
            setNotificationsIter(notificationsIter + 1);
        }).catch(e => {
            console.log(e);
            // setIsLoading(false);
        })
    }

    return (
        <>
            <div className="w-full sticky mb-8 top-0 z-30 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto h-16 flex items-center px-4">
                    <Link href="/"><a><img src="/logo.svg" className="h-12"/></a></Link>
                    <div className="flex h-16 bg-white dark:bg-gray-900 fixed bottom-0 left-0 w-full sm:ml-8 sm:w-auto sm:relative sm:h-full">
                        {session && (
                            <NavbarItem icon={<FiHome/>} text="Feed" href="/" selected={router.route === "/"}/>
                        )}
                        <NavbarItem icon={<FiSearch/>} text="Explore" href="/explore" selected={router.route === "/explore"}/>
                        {data && data.data && (
                            <NavbarItem icon={<FiUser/>} text="Profile" href={`/@${data.data.urlName}`} selected={router.asPath === `/@${data.data.urlName}`}/>
                        )}
                    </div>
                    
                    <div className="ml-auto flex items-center gap-x-4">                        
                        {session && <Link href="/new-update"><a className="up-button small primary hidden sm:block">Post new update</a></Link>}
                        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="up-button text">
                            <FiMoon/>
                        </button>
                        {session ? (
                            <>
                                {notifications && (
                                    <>
                                    <button className="mr-4 px-2 h-10 relative up-hover-button">
                                        <FiBell/>
                                        {notifications.length > 0 && (
                                            <>
                                                {numNotifications > 0 && (
                                                    <div className="rounded-full w-3 h-3 bg-red-500 top-0 right-0 absolute text-white font-bold">
                                                        <span style={{fontSize: 8, top: -9}} className="relative">{numNotifications}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {notifications.length > 0 && (
                                            <>
                                                 <div className="up-hover-dropdown cursor-default mt-10 w-64 md:w-96 overflow-y-auto max-h-96">
                                                    {notifications
                                                        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                                                        .map((notification: RichNotif) => (
                                                            <NotificationItem notification={notification} acceptRequest={acceptRequest} key={notification._id}/>
                                                        ))
                                                    }
                                                </div>
                                            </>
                                        )}
                                    </button>
                                    </>
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
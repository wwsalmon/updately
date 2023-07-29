import {signOut, useSession} from "next-auth/react";
import Link from "next/link";
import MenuButton from "./MenuButton";
import useSWR, {responseInterface} from "swr";
import MenuLink from "./MenuLink";
import {useRouter} from "next/router";
import NavbarItem from "./NavbarItem";
import {FiChevronDown, FiHome, FiMoon, FiSearch, FiUser} from "react-icons/fi";
import {fetcher} from "../utils/utils";
import {RichNotif} from "../utils/types";
import {useTheme} from "next-themes";
import {useEffect, useState} from "react";
import {IoMdExit} from "react-icons/io";
import SignInButton from "./SignInButton";
import FloatingCta from "./FloatingCTA";
import NavbarNotificationMenu from "./NavbarNotificationMenu";
import {useKey} from "../utils/hooks";
import Mousetrap from "mousetrap";
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';
import QuickSwitcher from "./QuickSwitcher";


export default function Navbar() {
    const router = useRouter();
    const {data: session} = useSession();
    const { data, error } = useSWR(session ? "/api/get-curr-user" : null, fetcher) || {data: null, error: null};
    const [notificationsIter, setNotificationsIter] = useState<number>(0);
    const { data: notificationData, error: notificationsError }: responseInterface<{ notifications: RichNotif[] }, any> = useSWR(session ? `/api/get-notifications?iter=${notificationsIter}` : null, fetcher);
    const [ notifications, setNotifications ] = useState<RichNotif[]>([]);
    const numNotifications = notifications.filter(d => !d.read).length
    const [isQuickSwitcher, setIsQuickSwitcher] = useState<boolean>(false);

    useEffect(() => {
        if (notificationData && notificationData.notifications) {
            setNotifications(notificationData.notifications)
        }
    }, [notificationData]);

    useEffect(() => {
        setNotificationsIter(notificationsIter + 1);
    }, [router.asPath]);

    const {theme, setTheme} = useTheme();

    useKey("KeyF", () => {if (router.route !== "/") router.push("/")})
    useKey("KeyE", () => {if (router.route !== "/explore") router.push("/explore")})
    useKey("KeyP", () => {if (router.route !== "/profile" && session) router.push("/@" + data.data.urlName)})
    useKey("KeyN", () => {if (router.route !== "/new-update" && session) router.push("/new-update")})

    useEffect(() => {

        function onQuickSwitcherShortcut(e) {
            e.preventDefault();
            setIsQuickSwitcher(prev => !prev);
        }

        Mousetrap.bindGlobal(['command+k', 'ctrl+k'], onQuickSwitcherShortcut);

        return () => {
            Mousetrap.unbind(['command+k', 'ctrl+k'], onQuickSwitcherShortcut);
        }
    });


    const NavbarDarkModeButton = () => (
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="up-button text">
            <FiMoon/>
        </button>
    );


    const NavbarProfileMenu = () => (
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
    );

    return (
        <>
            <QuickSwitcher isOpen={isQuickSwitcher} onRequestClose={() => setIsQuickSwitcher(false)}/>

            <div className="w-full sticky mb-8 top-0 z-30 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto h-16 flex items-center px-4">
                    <Link href="/"><a><img src="/logo.svg" className="h-12"/></a></Link>
                    <div className="flex h-16 bg-white dark:bg-gray-900 fixed bottom-0 left-0 w-full md:ml-8 md:w-auto md:relative md:h-full">
                        {session && (
                            <NavbarItem icon={<FiHome/>} text="Feed" href="/" selected={router.route === "/"}/>
                        )}
                        <NavbarItem icon={<FiSearch/>} text="Explore" href="/explore" selected={router.route === "/explore"}/>
                        {data && data.data && (
                            <NavbarItem icon={<FiUser/>} text="Profile" href={`/@${data.data.urlName}`} selected={router.asPath === `/@${data.data.urlName}`}/>
                        )}
                    </div>
                    <div className="ml-auto flex items-center gap-x-4">                        
                        {session && <Link href="/new-update"><a className="up-button small primary hidden lg:block">Post new update</a></Link>}
                        <NavbarDarkModeButton/>
                        {session ? (
                            <>
                                {notifications && <NavbarNotificationMenu notifications={notifications} numNotifications={numNotifications} setNotificationsIter={setNotificationsIter}/>}
                                <NavbarProfileMenu/>
                            </>
                        ) : (
                            <SignInButton/>
                        )}
                    </div>
                </div>
            </div>
            <FloatingCta/>
        </>
    );
}
import {FiBell} from "react-icons/fi";
import {RichNotif} from "../utils/types";
import {Dispatch, SetStateAction, useState} from "react";
import NotificationItem from "./NotificationItem";
import MenuItem from "./MenuItem";
import {MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight} from "react-icons/md";

const NavbarNotificationMenu = ({notifications, numNotifications, setNotificationsIter}: {notifications: RichNotif[], numNotifications: number, setNotificationsIter: Dispatch<SetStateAction<number>>}) => {
    const followReqs = notifications.filter(d => d.type === "request");
    const nonFollowReqs = notifications.filter(d => d.type !== "request");
    const [isFollowReqs, setIsFollowReqs] = useState(false);
    return (
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
                    <div className="up-hover-dropdown cursor-default mt-10 w-64 md:w-[32rem] overflow-y-auto max-h-96">
                        {isFollowReqs ? (
                            <>
                                <button onClick={() => setIsFollowReqs(false)} className="hover:bg-gray-50 dark:hover:bg-opacity-10 w-full">
                                        <MenuItem text={
                                            <div className="flex items-center gap-4">
                                                <MdOutlineKeyboardArrowLeft className="h-8 w-8 opacity-50"/>
                                                <p className="font-bold">Back</p>
                                            </div>
                                        }/>
                                    </button>
                                {followReqs.map(notification => (
                                <NotificationItem
                                    notification={notification}
                                    setNotificationsIter={setNotificationsIter}
                                    key={notification._id}
                                />
                                ))}
                            </>
                        ) : (
                            <>
                                {followReqs.length > 0 && (
                                    <button onClick={() => setIsFollowReqs(true)} className="hover:bg-gray-50 dark:hover:bg-opacity-10 w-full">
                                        <MenuItem text={
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={followReqs[0].authorArr[0].image}
                                                        alt={`Profile picture of ${followReqs[0].authorArr[0].name}`}
                                                        className="w-10 h-10 ml-2 rounded-full"
                                                    />
                                                    <p className="font-bold">Follow requests ({followReqs.length})</p>
                                                </div>
                                                <MdOutlineKeyboardArrowRight className="h-8 w-8 opacity-50"/>
                                            </div>
                                        }/>
                                    </button>
                                )}
                                {nonFollowReqs
                                    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                                    .map((notification: RichNotif) => (
                                        <NotificationItem
                                            notification={notification}
                                            setNotificationsIter={setNotificationsIter}
                                            key={notification._id}
                                        />
                                    ))
                                }
                            </>
                        )}
                    </div>
                </>
            )}
        </button>
    )
};


export default NavbarNotificationMenu
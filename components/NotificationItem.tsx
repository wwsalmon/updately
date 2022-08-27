import MenuItem from "./MenuItem";
import Link from "next/link";
import {format, formatDistanceToNow} from "date-fns";
import {RichNotif} from "../utils/types";
import {useSession} from "next-auth/react";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";

export default function NotificationItem({
                                             notification,
                                             setNotificationsIter,
                                         }: { notification: RichNotif, setNotificationsIter: Dispatch<SetStateAction<number>> }) {
    const {data: session, status} = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const acceptRequest = (notificationId) => {
        setIsLoading(true);
        axios.post("/api/accept-request", {
            notificationId: notificationId
        }).then(res => {
            setNotificationsIter(prev => prev + 1);
        }).catch(e => {
            console.log(e);
        }).finally(() => 
            setIsLoading(false)
        )
    }

    const rejectRequest = (notificationId) => {
        axios.post("/api/reject-request", {
            notificationId: notificationId
        }).then(res => {
            setNotificationsIter(prev => prev + 1);
        }).catch(e => {
            console.log(e);
        })
    }

    return (
        <div className={(notification.read && notification.type !== "request") ? "opacity-50" : ""}>
            <MenuItem
                text={(() => {
                    const thisAuthor = notification.authorArr[0];
                    const thisUpdate = notification.updateArr[0];
                    const thisUpdateUser = thisUpdate ? thisUpdate.userArr[0] : null;

                    const href: string = (notification.type === "follow" || notification.type === "request")
                        ?
                        `/@${thisAuthor.urlName}`
                        : `/@${thisUpdateUser.urlName}/${thisUpdate.url}`;

                    if (notification.type === "comment") {
                        return (
                            <>
                                <span>
                                    <Link href={href}><a><b>{thisAuthor.name}</b> commented on your {format(new Date(thisUpdate.date), "M/d/yy")} update</a></Link>
                                </span>
                            </>
                        );
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
                        );
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
                        );
                    }
                    if (notification.type === "request") {
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
                                    <div className="relative">
                                        <button
                                            className="up-button small primary"
                                            onClick={() => acceptRequest(notification._id)}
                                            disabled={isLoading}
                                        ><span className={isLoading ? "invisible" : ""}>Accept</span></button>
                                        {isLoading && <div className="up-spinner"/> }
                                    </div>
                                    <div className="relative">
                                        <button
                                            className="up-button small text"
                                            onClick={() => rejectRequest(notification._id)}
                                            disabled={isLoading}
                                        >Delete</button>
                                    </div>
                                </div>
                            </>
                        );
                    }
                    if (notification.type === "like") {
                        return (
                            <>
                                <div>
                                    <span>
                                        <b><Link href={href}><a>{thisAuthor.name} </a></Link></b>
                                        <Link href={href}><a>liked your {format(new Date(thisUpdate.date), "M/d/yy")} update</a></Link>
                                    </span>
                                    <br/>
                                    <span className="opacity-50">
                                        {formatDistanceToNow(new Date(notification.createdAt))} ago
                                    </span>
                                </div>
                            </>
                        );
                    }
                    if (notification.type === "likeComment") {
                        return (
                            <>
                                <span>
                                    <Link href={href}>
                                        <a>
                                            <b>{thisAuthor.name}</b> liked your comment on
                                            {" " + (thisAuthor.email === session.user.email ?
                                                    "your" :
                                                    thisUpdateUser._id === thisAuthor._id ?
                                                        "their" :
                                                        thisUpdateUser.name + "'s"
                                            ) + " "}
                                            {format(new Date(thisUpdate.date), "M/d/yy")} update
                                        </a>
                                    </Link>
                                </span>
                                <br/>
                                <span className="opacity-50">
                                    {formatDistanceToNow(new Date(notification.createdAt))} ago
                                </span>
                            </>
                        );
                    }
                    if (notification.type === "mentionUpdate") {
                        return (
                            <>
                                <div>
                                    <span>
                                        <b><Link href={href}><a>{thisAuthor.name} </a></Link></b>
                                        <Link href={href}><a>mentioned you in their {format(new Date(thisUpdate.date), "M/d/yy")} update</a></Link>
                                    </span>
                                    <br/>
                                    <span className="opacity-50">
                                        {formatDistanceToNow(new Date(notification.createdAt))} ago
                                    </span>
                                </div>
                            </>
                        );
                    }
                    if (notification.type === "mentionComment") {
                        return (
                            <>
                                <span>
                                    <Link href={href}>
                                        <a>
                                            <b>{thisAuthor.name}</b> mentioned you in their comment on
                                            {" " + (thisUpdateUser.email === session.user.email ?
                                                    "your" :
                                                    thisUpdateUser._id === thisAuthor._id ?
                                                        "their" :
                                                        thisUpdateUser.name + "'s"
                                            ) + " "}
                                            {format(new Date(thisUpdate.date), "M/d/yy")} update
                                        </a>
                                    </Link>
                                </span>
                                <br/>
                                <span className="opacity-50">
                                    {formatDistanceToNow(new Date(notification.createdAt))} ago
                                </span>
                            </>
                        );
                    }
                })()}
                nowrap={false}
            />
        </div>
    );
}
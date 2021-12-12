import MenuItem from "./MenuItem";
import Link from "next/link";
import {format, formatDistanceToNow} from "date-fns";
import {RichNotif} from "../utils/types";
import {useSession} from "next-auth/client";

export default function NotificationItem({
                                             notification,
                                             acceptRequest
                                         }: { notification: RichNotif, acceptRequest: (notifId: string) => any }) {
    const [session, loading] = useSession();

    return (
        <div className={(notification.read && notification.type !== "request") ? "opacity-50" : ""}>
            <MenuItem
                text={(() => {
                    const thisAuthor = notification.authorArr[0];
                    const thisUpdate = notification.updateArr[0];
                    const thisComment = notification.commentArr[0];
                    const thisUpdateUser = thisUpdate ? thisUpdate.userArr[0] : null;
                    const thisCommentUpdate = thisComment ? thisComment.updateArr[0] : null;
                    const thisCommentUpdateUser = thisCommentUpdate ? thisCommentUpdate.userArr[0] : null;

                    const href: string = (notification.type === "follow" || notification.type === "request")
                        ?
                        `/@${thisAuthor.urlName}`
                        : (notification.type === "likeComment") ?
                            `/@${thisCommentUpdateUser.urlName}/${thisCommentUpdate.url}`
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
                                    <button
                                        className="up-button small primary"
                                        onClick={() => acceptRequest(notification._id)}
                                    >Accept
                                    </button>
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
                                            {" " + (thisCommentUpdateUser.email === session.user.email ?
                                                    "your" :
                                                    thisCommentUpdateUser._id === thisAuthor._id ?
                                                        "their" :
                                                        thisCommentUpdateUser.name + "'s"
                                            ) + " "}
                                            {format(new Date(thisCommentUpdate.date), "M/d/yy")} update
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
                })()}
                nowrap={false}
            />
        </div>
    );
}
import React from 'react';
import {User} from "../utils/types";
import Link from "next/link";
import classNames from 'classnames';

export default function UserPfpList({userList, pageUser, isFollowers, isSmall, className}: {
    userList: User[],
    pageUser?: User,
    isFollowers?: boolean,
    isSmall?: boolean,
    className?: string,
}) {
    const widthClass = isSmall ? "w-4" : "w-8";
    const heightClass = isSmall ? "h-4" : "h-8";
    const marginClass = isSmall ? "mr-1" : "mr-3";

    return (
        <div className={classNames("flex flex-shrink-0", className)}>
            {userList.slice(0, 5).map((user, i) => (
                <Link href={"/@" + user.urlName} key={user.urlName}>
                    <a>
                        <img src={user.image} className={classNames(widthClass, heightClass, marginClass, "rounded-full")} alt={user.name}/>
                    </a>
                </Link>
            ))}
            {userList.length > 6 && (
                <Link href={pageUser ? `/@${pageUser.urlName}/${isFollowers ? "followers" : "following"}` : ""}>
                    <a className={classNames(widthClass, heightClass, "rounded-full bg-black text-white items-center inline-flex justify-center")}>
                        +{userList.length - 6}
                    </a>
                </Link>
            )}
        </div>
    );
}
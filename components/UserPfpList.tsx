import React from 'react';
import {User} from "../utils/types";
import Link from "next/link";

export default function UserPfpList({userList, pageUser, isFollowers, isSmall}: {
    userList: User[],
    pageUser?: User,
    isFollowers?: boolean,
    isSmall?: boolean,
}) {
    const widthClass = isSmall ? "w-4" : "w-10";
    const heightClass = isSmall ? "h-4" : "h-10";
    const marginClass = isSmall ? "mr-1" : "mr-4";

    return (
        <div className="flex">
            {userList.slice(0, 12).map((user, i) => (
                <Link href={"/@" + user.urlName} key={user.urlName}>
                    <a className={i > 4 ? "hidden sm:block" : ""}>
                        <img src={user.image} className={`${widthClass} ${heightClass} ${marginClass} rounded-full`} alt={user.name}/>
                    </a>
                </Link>
            ))}
            {userList.length > 12 && (
                <Link href={pageUser ? `/@${pageUser.urlName}/${isFollowers ? "followers" : "following"}` : ""}>
                    <a className={`${widthClass} ${heightClass} rounded-full bg-black text-white items-center hidden sm:inline-flex justify-center`}>
                        +{userList.length - 12}
                    </a>
                </Link>
            )}
            {userList.length > 5 && (
                <Link href={pageUser ? `/@${pageUser.urlName}/${isFollowers ? "followers" : "following"}` : ""}>
                    <a className={`${widthClass} ${heightClass} rounded-full bg-black text-white items-center sm:hidden inline-flex justify-center`}>
                        +{userList.length - 5}
                    </a>
                </Link>
            )}
        </div>
    );
}
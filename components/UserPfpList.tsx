import React from 'react';
import {User} from "../utils/types";
import Link from "next/link";

export default function UserPfpList({userList, pageUser, isFollowers}: {
    userList: User[],
    pageUser: User,
    isFollowers: boolean
}) {
    return (
        <div className="flex">
            {userList.slice(0, 12).map((user, i) => (
                <Link href={"/@" + user.urlName} key={user.urlName}>
                    <a className={i > 4 ? "hidden sm:block" : ""}>
                        <img src={user.image} className="w-10 h-10 rounded-full mr-4" alt={user.name}/>
                    </a>
                </Link>
            ))}
            {userList.length > 12 && (
                <Link href={`/@${pageUser.urlName}/${isFollowers ? "followers" : "following"}`}>
                    <a className="w-10 h-10 rounded-full bg-black text-white items-center hidden sm:inline-flex justify-center">
                        +{userList.length - 12}
                    </a>
                </Link>
            )}
            {userList.length > 5 && (
                <Link href={`/@${pageUser.urlName}/${isFollowers ? "followers" : "following"}`}>
                    <a className="w-10 h-10 rounded-full bg-black text-white items-center sm:hidden inline-flex justify-center">
                        +{userList.length - 5}
                    </a>
                </Link>
            )}
        </div>
    );
}
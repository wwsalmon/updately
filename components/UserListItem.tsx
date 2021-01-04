import React, {Dispatch, SetStateAction, useState} from 'react';
import {User} from "../utils/types";
import Link from "next/link";
import FollowButton from "./FollowButton";
import axios from "axios";

export default function UserListItem({itemUserId, userList, setUserList, userData, setUserData}: {
    itemUserId: string,
    userList: User[], 
    setUserList: Dispatch<SetStateAction<User[]>>,
    userData: User,
    setUserData: Dispatch<SetStateAction<User>>,
}) {
    const thisUser = userList.find(d => d._id === itemUserId);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function onFollow() {
        setIsLoading(true);

        axios.post("/api/follow-user", {
            id: itemUserId,
        }).then(res => {
            setIsLoading(false);
            setUserData(res.data.currUserData);
            let newUserList = {...userList};
            const thisUserIndex =  newUserList.findIndex(d => d._id === itemUserId);
            newUserList[thisUserIndex] = res.data.followUserData;
            setUserList(newUserList);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        });
    }

    return (
        <>
            <div className="my-4 flex items-center">
                <Link href={"/@" + thisUser.urlName} key={thisUser.urlName}>
                    <a className="flex items-center">
                        <img src={thisUser.image} className="w-16 h-16 rounded-full mr-6" alt={thisUser.name}/>
                        <div className="up-ui-item-title"><span>{thisUser.name}</span></div>
                    </a>
                </Link>
                {userData && userData._id !== thisUser._id && (
                    <div className="ml-auto">
                        <FollowButton
                            isFollowing={userData && (userData.following.includes(thisUser._id))}
                            isLoading={isLoading}
                            isLoggedIn={!!userData}
                            onClick={onFollow}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
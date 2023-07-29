import React, {Dispatch, SetStateAction, useState} from 'react';
import {User} from "../utils/types";
import Link from "next/link";
import FollowButton from "./FollowButton";
import axios from "axios";
import RemoveFollowerButton from './RemoveFollowerButton';

export default function UserListItem({itemUserId, userList, setUserList, userData, setUserData, showRemoveFollows}: {
    itemUserId: string,
    userList: User[], 
    setUserList: Dispatch<SetStateAction<User[]>>,
    userData: User,
    setUserData: Dispatch<SetStateAction<User>>,
    showRemoveFollows: boolean,
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

    function onRemoveFollow() {
        setIsLoading(true);

        axios.post("/api/remove-follower", {
            id: itemUserId,
        }).then(res => {
            setUserData(res.data.currUserData)
            setUserList(list => list.filter(d => d._id !== itemUserId))
        }).finally(() => setIsLoading(false))
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
                    <div className={`ml-auto flex gap-6`}>
                        {showRemoveFollows && <RemoveFollowerButton
                            isFollowing={userData && (userData.following.includes(thisUser._id))}
                            isRequesting={userData && (userData.requesting.includes(thisUser._id))}
                            isLoading={isLoading}
                            isLoggedIn={!!userData}
                            onClick={onRemoveFollow}
                        />}
                        <div className={showRemoveFollows && userData && (!userData.following.includes(thisUser._id)) && "mx-3"}>
                            <FollowButton
                                isFollowing={userData && (userData.following.includes(thisUser._id))}
                                isRequesting={userData && (userData.requesting.includes(thisUser._id))}
                                isLoading={isLoading}
                                isLoggedIn={!!userData}
                                onClick={onFollow}
                                primary={showRemoveFollows}
                                secondary={showRemoveFollows}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
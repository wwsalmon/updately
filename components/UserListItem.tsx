import React, {Dispatch, SetStateAction, useState} from 'react';
import {User} from "../utils/types";
import Link from "next/link";
import FollowButton from "./FollowButton";
import axios from "axios";
import RemoveFollowerButton from './RemoveFollowerButton';
import Modal from './Modal';

export default function UserListItem({itemUserId, userList, setUserList, userData, setUserData, showRemoveFollows = false}: {
    itemUserId: string,
    userList: User[], 
    setUserList: Dispatch<SetStateAction<User[]>>,
    userData: User,
    setUserData: Dispatch<SetStateAction<User>>,
    showRemoveFollows?: boolean,
}) {
    const thisUser = userList.find(d => d._id === itemUserId);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRemoveFollowModalOpen, setIsRemoveFollowModalOpen] = useState<boolean>(false);

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
            <RemoveFollowerConfirmationModal
                isOpen={isRemoveFollowModalOpen}
                setIsOpen={setIsRemoveFollowModalOpen}
                onRemoveFollow={onRemoveFollow}
                isLoading={isLoading}
                name={thisUser.name}
            />
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
                            onClick={() => setIsRemoveFollowModalOpen(true)}
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

export function RemoveFollowerConfirmationModal({isOpen, setIsOpen, onRemoveFollow, isLoading, name}: {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    onRemoveFollow: () => void,
    isLoading: boolean,
    name: string,
}) {
    

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <p>Remove {name} from your followers? {name.split(" ")[0]} will no longer be able to see your updates until they request to follow you again.</p>
            <div className="flex items-center mt-4 gap-2">
                <button
                    className="up-button danger small relative block"
                    onClick={onRemoveFollow}
                    disabled={isLoading}
                >
                    <span className={isLoading && "invisible"}>Remove</span>
                    {isLoading && (
                        <div className="up-spinner"/>
                    )}
                </button>
                <button
                    className="up-button text block"
                    onClick={() => setIsOpen(false)}
                >
                    Cancel
                </button>
            </div>
        </Modal>
    )
}
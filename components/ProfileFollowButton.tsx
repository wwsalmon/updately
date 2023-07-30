import axios from "axios";
import {Dispatch, SetStateAction, useState} from "react";
import {Update, User} from "../utils/types";
import FollowButton from "./FollowButton";
import { GetUpdateRequestResponse } from "../utils/requests";

export default function ProfileFollowButton({pageUser, updatePageUser, userData, setUserData, primary = false}: {
    pageUser: User,
    updatePageUser: (User) => any,
    userData: User,
    setUserData: Dispatch<SetStateAction<User>>,
    primary?: boolean,
}){
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function onFollow() {
        setIsLoading(true);

        axios.post("/api/follow-user", {
            id: pageUser._id,
        }).then(res => {
            setIsLoading(false);
            setUserData(res.data.currUserData);
            updatePageUser(res.data.followUserData);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        });
    }

    return (
        <>
            <FollowButton
                isFollowing={userData && userData.following.includes(pageUser._id)}
                isRequesting={userData && userData.requesting.includes(pageUser._id)}
                isLoading={isLoading}
                isLoggedIn={!!userData}
                onClick={onFollow}
                primary={primary}
            />
        </>
    )
}
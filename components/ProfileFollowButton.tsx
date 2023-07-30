import axios from "axios";
import {Dispatch, SetStateAction, useState} from "react";
import {Update, User} from "../utils/types";
import FollowButton from "./FollowButton";
import { GetUpdateRequestResponse } from "../utils/requests";

export default function ProfileFollowButton({data, setData, userData, setUserData, primary = false}: {
    data: GetUpdateRequestResponse,
    setData: Dispatch<SetStateAction<GetUpdateRequestResponse>>,
    userData: User,
    setUserData: Dispatch<SetStateAction<User>>,
    primary?: boolean,
}){
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function onFollow() {
        setIsLoading(true);

        axios.post("/api/follow-user", {
            id: data.user._id,
        }).then(res => {
            setIsLoading(false);
            setUserData(res.data.currUserData);
            let newData = {...data};
            newData.user = res.data.followUserData;
            setData(newData);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        });
    }

    return (
        <>
            <FollowButton
                isFollowing={userData && userData.following.includes(data.user._id)}
                isRequesting={userData && userData.requesting.includes(data.user._id)}
                isLoading={isLoading}
                isLoggedIn={!!userData}
                onClick={onFollow}
                primary={primary}
            />
        </>
    )
}
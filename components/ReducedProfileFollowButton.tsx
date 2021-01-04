import axios from "axios";
import {Dispatch, SetStateAction, useState} from "react";
import {Update, User} from "../utils/types";
import FollowButton from "./FollowButton";

export default function ReducedProfileFollowButton({data, setData, userData, setUserData, primary = false}: {
    data: User,
    setData: Dispatch<SetStateAction<User>>,
    userData: User,
    setUserData: Dispatch<SetStateAction<User>>,
    primary?: boolean,
}){
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function onFollow() {
        setIsLoading(true);

        axios.post("/api/follow-user", {
            id: data._id,
        }).then(res => {
            setIsLoading(false);
            setUserData(res.data.currUserData);
            setData(res.data.followUserData);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        });
    }

    return (
        <>
            <FollowButton
                isFollowing={userData && userData.following.includes(data._id)}
                isLoading={isLoading}
                isLoggedIn={!!userData}
                onClick={onFollow}
                primary={primary}
            />
        </>
    )
}
import axios from "axios";
import {Dispatch, SetStateAction, useState} from "react";
import {Update, User} from "../utils/types";
import FollowButton from "./FollowButton";

export default function ProfileFollowButton({data, setData, userData, setUserData, primary = false}: {
    data: {user: User, updates: Update[]},
    setData: Dispatch<SetStateAction<{user: User, updates: Update[]}>>,
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
                isLoading={isLoading}
                isLoggedIn={!!userData}
                onClick={onFollow}
                primary={primary}
            />
        </>
    )
}
import axios from "axios";
import {Dispatch, SetStateAction, useState} from "react";
import Link from "next/link";
import {Update, User} from "../utils/types";

export default function FollowButton({data, setData, userData, setUserData, primary = false}: {
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
            setData(res.data.followUserData);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        });
    }

    return (
        <>
            {userData ? (
                <div className="relative">
                    {userData.following.includes(data.user._id) ? (
                        <button className="up-button text" onClick={onFollow}>
                            <span className={isLoading ? "invisible" : ""}>Following</span>
                        </button>
                    ) : (
                        <button className={`up-button small ${primary ? "primary" : ""}`} onClick={onFollow}>
                            <span className={isLoading ? "invisible" : ""}>Follow</span>
                        </button>
                    )}
                    {isLoading && (
                        <div className="up-spinner dark"/>
                    )}
                </div>
            ) : (
                <Link href="/sign-in"><a className="up-button small">Follow</a></Link>
            )}
        </>
    )
}
import React, {useEffect, useState} from 'react';
import {User} from "../utils/types";
import axios from "axios";
import {FiX} from "react-icons/fi";
import UserListItem from "./UserListItem";

export default function ExploreSearch(props: { userData: User }) {
    const [query, setQuery] = useState<string>("");
    const [userData, setUserData] = useState<User>(props.userData);
    console.log(userData)
    const [userList, setUserList] = useState<User[]>([]);

    useEffect(() => {
        if (query === "") return setUserList([]);

        axios.get(`/api/search-user`, {
            params: {
                s: query,
            }
        }).then(res => {
            setUserList(res.data.results);
        }).catch(e => {
            console.log(e);
        });
    }, [query]);

    return (
        <>
            <div className="relative my-8">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full border px-4 h-12 rounded-md text-xl"
                    placeholder="Search for Updately user"
                />
                <button
                    className="absolute right-4 text-xl opacity-25 hover:opacity-100"
                    onClick={() => setQuery("")}
                    style={{top: "50%", transform: "translateY(-50%)"}}
                >
                    <FiX/>
                </button>
            </div>
            {userList.map(user => (
                <UserListItem
                    itemUserId={user._id}
                    userList={userList}
                    setUserList={setUserList}
                    userData={userData}
                    setUserData={setUserData}
                />
            ))}
        </>
    );
}
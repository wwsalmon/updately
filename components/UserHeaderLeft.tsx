import React from 'react';
import {User} from "../utils/types";
import {format} from "date-fns";

export default function UserHeaderLeft({pageUser, userData}: { pageUser: User, userData: User }) {
    return (
        <div className="flex items-center">
            <div className="w-16 mr-8">
                <img src={pageUser.image} alt={`Profile picture of ${pageUser.name}`} className="w-full rounded-full"/>
            </div>
            <div>
                <h1 className="up-h1">{pageUser.name}</h1>
                <p className="my-2">Joined {format(new Date(pageUser.createdAt), "MMMM d, yyyy")}</p>
                {userData && pageUser.following.includes(userData._id) && (
                    <p className="text-xs bg-black rounded-md p-2 text-white inline-block">Follows you</p>
                )}
            </div>
        </div>
    );
}
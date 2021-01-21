import React from 'react';
import {User} from "../utils/types";

export default function UserHeaderLeft({pageUser, userData}: { pageUser: User, userData: User }) {
    return (
        <div className="flex items-center">
            <div className="w-16 mr-8">
                <img src={pageUser.image} alt={`Profile picture of ${pageUser.name}`} className="w-full rounded-full"/>
            </div>
            <div>
                <h1 className="up-h1">{pageUser.name}</h1>
                {userData && pageUser.following.includes(userData._id) && (
                    <p className="text-xs mt-2 bg-black rounded-md p-2 text-white inline-block">Follows you</p>
                )}
            </div>
        </div>
    );
}
import React from "react";
import {User} from "../utils/types";

export default function MentionItem({focused, user}: {focused: boolean, user: User}) {
    return (
        <div className={`flex items-center px-2 py-1 ${focused ? "bg-gray-100" : ""}`}>
            <img src={user.image} className="w-4 h-4 rounded-full mr-2" alt={user.name}/>
            <span>{user.name}</span>
        </div>
    );
}
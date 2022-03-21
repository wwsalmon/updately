import {User} from "../utils/types";
import React, {useState} from "react";
import {NextSeo} from "next-seo";
import UserHeaderLeft from "./UserHeaderLeft";
import ReducedProfileFollowButton from "./ReducedProfileFollowButton";
import Link from "next/link";
import {FiArrowLeft} from "react-icons/fi";
import UserListItem from "./UserListItem";

export default function UserFollowListPage(props: {
    pageUser: User,
    userData: User,
    userList: User[],
    isFollowers: boolean,
}) {
    const [pageUser, setPageUser] = useState<User>(props.pageUser);
    const [userData, setUserData] = useState<User>(props.userData);
    const [userList, setUserList] = useState<User[]>(props.userList);
    const isOwner = props.userData && (props.pageUser.email === props.userData.email);

    return (
        <div className="max-w-4xl mx-auto px-4">
            <NextSeo
                title={props.isFollowers ? `${pageUser.name}'s followers` : `Users that ${pageUser.name} follows` + ` | Updately`}
                description={`Follow ${pageUser.name} on Updately to get their updates in your feed.`}
            />
            <div className="sm:flex my-16">
                <UserHeaderLeft pageUser={pageUser} userData={userData}/>
                <div className="flex sm:ml-auto mt-6 sm:mt-0">
                    <div className="ml-auto">
                        {!isOwner && (
                            <ReducedProfileFollowButton
                                data={pageUser}
                                setData={setPageUser}
                                userData={userData}
                                setUserData={setUserData}
                                primary={true}
                            />
                        )}
                    </div>
                </div>
            </div>
            <Link href={`/@${pageUser.urlName}`}>
                <a className="flex items-center">
                    <FiArrowLeft/>
                    <span className="ml-2">Back to profile</span>
                </a>
            </Link>
            <hr className="my-8"/>
            <h2 className="up-ui-title mb-8">
                {props.isFollowers ? "Followers" : "Following"} ({userList.length})
            </h2>

            {userList.map(user => (
                <div key={user._id}>
                    <UserListItem
                        itemUserId={user._id}
                        userList={userList}
                        setUserList={setUserList}
                        userData={userData}
                        setUserData={setUserData}
                    />
                </div>
            ))}
        </div>
    );
}
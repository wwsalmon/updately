import React, {useState} from 'react';
import {GetServerSideProps} from "next";
import {getProfileReducedRequest} from "../api/get-profile";
import {getSession} from "next-auth/react";
import {cleanForJSON} from "../../utils/utils";
import {User} from "../../utils/types";
import {NextSeo} from "next-seo";
import UserHeaderLeft from "../../components/UserHeaderLeft";
import Link from "next/link";
import axios from "axios";
import {useRouter} from "next/router";
import Select from "react-select";
import {useTheme} from "next-themes";
import CustomSelect from '../../components/CustomSelect';


export default function EditBioPage(props: { userData: User }) {
    const initialPrivacy = props.userData.truePrivate ? "private" : props.userData.private ? "unlisted" : "public";

    const router = useRouter();
    const [userData, setUserData] = useState<User>(props.userData);
    const [bio, setBio] = useState<string>(props.userData.bio || "");
    const [privacy, setPrivacy] = useState<"public" | "private" | "unlisted">(initialPrivacy);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {theme, setTheme} = useTheme();
      
    function saveProfile() {
        setIsLoading(true);
        axios.post("/api/edit-profile", {
            id: userData._id,
            bio: bio,
            private: privacy === "unlisted",
            truePrivate: privacy === "private",
        }).then(res => {
            setUserData(res.data.userData);
            router.push(`/@${userData.urlName}`);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        })
    }

    const options = [
        { value: "public", label: "Public (show in public feeds, link accessible)" },
        { value: "unlisted", label: "Unlisted (hidden in public feeds, link accessible)" },
        { value: "private", label: "Private (hidden in public feeds, not link accessible)" },
    ]

    return (
        <div className="max-w-4xl mx-auto px-4">
            <NextSeo
                title="Edit profile | Updately"
            />
            <div className="mt-16 mb-8">
                <UserHeaderLeft pageUser={userData}/>
            </div>
            <h2 className="up-ui-title mb-4">
                Add/edit bio
            </h2>
            <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full border p-4 rounded-md text-xl"
                placeholder="Write a bio..."
            />

            <div className="mt-8">
                <div className="">
                    <div className="mb-4">
                        <h2 className="up-ui-title mb-2">
                            Privacy settings
                        </h2>
                    </div>
                    <CustomSelect 
                        options={options}
                        defaultValue={options.find(d => d.value === privacy)}
                        onChange={option => setPrivacy(option.value)}
                        isSearchable={false}
                        className="rounded-md text-xl"
                        isDisabled={isLoading}
                    />
                </div>
            </div>

            <div className="flex mt-10">
                <div className="ml-auto relative">
                    <Link href={`/@${userData.urlName}`}>
                        <a className={`up-button text small ml-auto mr-4 ${isLoading ? "cursor-not-allowed" : ""}`}>
                            Cancel
                        </a>
                    </Link>
                </div>
                <div className="relative">
                    <button
                        className="up-button primary small"
                        disabled={((userData.bio ? userData.bio === bio : bio === "") && (privacy === initialPrivacy)) || isLoading}
                        onClick={saveProfile}
                    >
                        Save
                    </button>
                    {isLoading && (
                        <div className="up-spinner"/>
                    )}
                </div>
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (Array.isArray(context.params.username) || context.params.username.substr(0, 1) !== "@") return { notFound: true };
    const username: string = context.params.username.substr(1);
    const pageUser = await getProfileReducedRequest(username);
    if (!pageUser) return { notFound: true };

    const session = await getSession(context);
    if (session.user.email !== pageUser.email) {
        return { notFound: true };
    }

    return { props: { userData: cleanForJSON(pageUser) }};
};
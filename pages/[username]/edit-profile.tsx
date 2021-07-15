import React, {useState, Component} from 'react';
import {GetServerSideProps} from "next";
import {getProfileReducedRequest} from "../api/get-profile";
import {getSession} from "next-auth/client";
import {cleanForJSON} from "../../utils/utils";
import {User} from "../../utils/types";
import {NextSeo} from "next-seo";
import UserHeaderLeft from "../../components/UserHeaderLeft";
import Link from "next/link";
import axios from "axios";
import {useRouter} from "next/router";
import {FaUnlock, FaLock} from "react-icons/fa";
import Select from "react-select";


export default function EditBioPage(props: { userData: User }) {
    const router = useRouter();
    const [userData, setUserData] = useState<User>(props.userData);
    const [bio, setBio] = useState<string>(props.userData.bio || "");
    const [isPrivate, setIsPrivate] = useState<boolean>(props.userData.private || false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
      
    function saveBio() {
        setIsLoading(true);
        axios.post("/api/edit-profile", {
            id: userData._id,
            bio: bio,
            private: isPrivate,
        }).then(res => {
            setUserData(res.data.userData);
            router.push(`/@${userData.urlName}`);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        })
    }

    const options = [
        { value: false, label: "Show" },
        { value: true, label: "Hide" },
    ]
    
    const customStyles = {
        option: (provided) => ({
            ...provided,
            padding: 8,
            paddingRight: 16,
            paddingLeft: 16,
        }),

        valueContainer: (provided) => ({
            ...provided,
            padding: 8,
            paddingRight: 16,
            paddingLeft: 16,
        }),

        control: (provided) => ({
            ...provided,
            borderColor: "#e5e7eb",
        }),

        container: (provided) => ({
            ...provided,
            marginBottom: 8,
        }),
        
    }

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
                    <h2 className="up-ui-title mb-4">
                        Hide posts from global feed?
                    </h2>
                    <Select 
                        options={options}
                        defaultValue={options.filter(o => o.value === isPrivate)}
                        onChange={option => setIsPrivate(option.value)}
                        isSearchable={false}
                        className="rounded-md text-xl"
                        isDisabled={isLoading}
                        styles={customStyles}
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
                        disabled={((userData.bio ? userData.bio === bio : bio === "") && (userData.private === isPrivate)) || isLoading}
                        onClick={saveBio}
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
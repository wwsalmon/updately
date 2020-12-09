import React, {useEffect, useState} from 'react';
import axios from "axios";
import Link from "next/link";
import {NextSeo} from "next-seo";
import {FaTimes} from "react-icons/fa";

export default function SearchPage() {
    const [query, setQuery] = useState<string>("");
    const [matches, setMatches] = useState<{
        _id: any,
        name: string,
        image: string,
        urlName: string,
    }[]>([]);

    useEffect(() => {
        if (query === "") return setMatches([]);

        axios.get(`/api/search-user`, {
            params: {
                s: query,
            }
        }).then(res => {
            setMatches(res.data.results);
        }).catch(e => {
            console.log(e);
        });
    }, [query]);

    return (
        <>
            <NextSeo
                title="Search for users | Updately, the social platform for daily updates"
                description="Write daily updates, share them with friends, and see friends' updates for social accountability and goal-setting."
            />
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="up-h1">Search for users</h1>
                <div className="relative mt-6 mb-12">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full border px-4 h-12 rounded-md text-xl"
                        placeholder="Who are you looking for?"
                    />
                    <button
                        className="absolute right-4 text-xl opacity-25 hover:opacity-100"
                        onClick={() => setQuery("")}
                        style={{top: "50%", transform: "translateY(-50%)"}}
                    >
                        <FaTimes/>
                    </button>
                </div>
                {matches.map((match, i) => (
                    <Link href={"/@" + match.urlName} key={match.urlName}>
                        <a>
                            <div className="my-4 flex items-center">
                                <img src={match.image} className="w-16 h-16 rounded-full mr-6" alt={match.name}/>
                                <div className="up-ui-item-title"><span>{match.name}</span></div>
                            </div>
                        </a>
                    </Link>
                ))}
            </div>
        </>
    );
}
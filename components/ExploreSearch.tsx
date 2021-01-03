import React, {useEffect, useState} from 'react';
import {User} from "../utils/types";
import axios from "axios";
import Link from "next/link";
import {FiX} from "react-icons/fi";

export default function ExploreSearch({userData}: { userData: User }) {
    const [query, setQuery] = useState<string>("");
    const [matches, setMatches] = useState<User[]>([]);

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
        </>
    );
}
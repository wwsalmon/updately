import { useRouter } from "next/router";
import {GetServerSideProps} from "next";
import {getProfileRequest} from "../api/get-profile";
import {getSession} from "next-auth/client";
import {getUpdateRequest} from "../../utils/requests";
import {format} from "date-fns";
import {dateOnly} from "../../utils/utils";
import MarkdownView from "react-showdown";
import Link from "next/link";

export default function UserProfile({ data, updateUrl }) {
    const thisUpdate = data.updates.find(d => d.url === encodeURIComponent(updateUrl));

    return (
        <div className="max-w-7xl relative mx-auto">
            <div className="max-w-3xl mx-auto px-4">
                <Link href={`/@${data.urlName}`}>
                    <a className="flex h-16 my-8 items-center sticky top-0 bg-white z-10">
                        <img src={data.image} alt={`Profile picture of ${data.name}`} className="w-10 h-10 rounded-full mr-4"/>
                        <div>
                            <div className="up-ui-title"><span>{data.name}</span></div>
                        </div>
                        <div className="ml-auto opacity-50">
                            <span>{format(dateOnly(thisUpdate.date), "MMMM dd, yyyy")}</span>
                        </div>
                    </a>
                </Link>
                <h1 className="up-h1">{format(dateOnly(thisUpdate.date), "EEEE, MMMM dd")}</h1>
                <h2 className="up-h2">{thisUpdate.title}</h2>
                <hr className="my-8"/>
                <div className="prose content my-8">
                    <MarkdownView markdown={thisUpdate.body} options={{ strikethrough: true, tasklists: true }}/>
                </div>
            </div>
            <div className="absolute left-4 top-8 hidden xl:block h-full">
                <div className="sticky top-24">
                    {data.updates.sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((update) => (
                        <div
                            className={`mb-8 leading-snug ${update._id === thisUpdate._id ? "" : "opacity-50 hover:opacity-100 transition"}`}
                            key={update._id}
                        >
                            <Link href={`/@${data.urlName}/${update.url}`}>
                                <a>
                                    <div className="font-bold"><span>{format(dateOnly(update.date), "MMMM dd, yyyy")}</span></div>
                                    <div><span>{update.title.substr(0,24)}{update.title.length > 24 ? "..." : ""}</span></div>
                                </a>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (Array.isArray(context.params.username) || Array.isArray(context.params.updateUrl) || context.params.username.substr(0, 1) !== "@") return { notFound: true };
    const username: string = context.params.username.substr(1);
    const updateUrl: string = context.params.updateUrl;
    const data = await getUpdateRequest(username, updateUrl);

    if (!data) return { notFound: true };

    if (data.private) {
        const session = await getSession();

        if (!session || data.followers.findIndex(d => d === session.user.email)) {
            let resData = data.slice(0);
            delete resData.updates;
            delete resData.followers;
            delete resData.following;
            resData.privateView = true;
            return { props: { data: resData, updateUrl: updateUrl }};
        }
    }

    return { props: { data: JSON.parse(JSON.stringify(data)), updateUrl: updateUrl }};
};
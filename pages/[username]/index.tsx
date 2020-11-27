import {GetServerSideProps} from "next";
import {getProfileRequest} from "../api/get-profile";
import {getSession, useSession} from "next-auth/client";
import {format} from "date-fns";
import wordsCount from "words-count";
import Link from "next/link";
import {dateOnly} from "../../utils/utils";

export default function UserProfile({ data }) {
    console.log(data);

    const [session, loading] = useSession();
    const isOwner = !loading && session && (data.email === session.user.email);

    return (
        <div className="max-w-4xl mx-auto px-4">

            <div className="my-4 up-ui-title">
                <span>User profile</span>
            </div>

            <div className="flex my-8">
                <div className="w-16 mr-8">
                    <img src={data.image} alt={`Profile picture of ${data.name}`} className="w-full rounded-full"/>
                </div>
                <h1 className="up-h1">{data.name}</h1>
            </div>

            <hr className="my-8"/>

            {data.privateView ? (
                <p>This user's profile is private and you do not have permission to view it. Request to follow this user to see their updates.</p>
            ) : (
                <>
                    <div className="flex items-center">
                        <h2 className="up-ui-title my-4">Latest updates</h2>

                        {isOwner && (
                            <Link href="/new-update"><a className="up-button primary my-4 ml-auto">Post new update</a></Link>
                        )}
                    </div>

                    {data.updates.length > 0 ? data.updates.sort((a, b) => +new Date(b.date) - +new Date(a.date)).map(update => (
                        <a key={update._id} className="block my-8" href={`/@${data.urlName}/${update.url}`}>
                            <h3 className="up-ui-item-title">{format(dateOnly(update.date), "MMMM dd, yyyy")}</h3>
                            <p className="up-ui-item-subtitle">
                                {update.title && (<span className="mr-2">{update.title}</span>)}
                                <span className="opacity-50">{wordsCount(update.body)} word{wordsCount(update.body) > 1 ? "s" : ""}</span>
                            </p>
                        </a>
                    )) : (
                        <p className="up-ui-item-subtitle">No updates yet.</p>
                    )}
                </>
            )}

        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (Array.isArray(context.params.username) || context.params.username.substr(0, 1) !== "@") return { notFound: true };
    const username: string = context.params.username.substr(1);
    const data = await getProfileRequest(username);

    console.log(username, data);

    if (!data) return { notFound: true };

    if (data.private) {
        const session = await getSession();

        if (!session || data.followers.findIndex(d => d === session.user.email)) {
            let resData = data.slice(0);
            delete resData.updates;
            delete resData.followers;
            delete resData.following;
            resData.privateView = true;
            return { props: { data: resData }};
        }
    }

    return { props: { data: JSON.parse(JSON.stringify(data)) }};
};
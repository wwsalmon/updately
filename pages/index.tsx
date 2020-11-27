import {useSession} from 'next-auth/client';
import {signIn, signOut} from 'next-auth/client';
import Navbar from "../components/navbar";

export default function Home() {
    const [session, loading] = useSession();

    console.log(session);

    const testDates: {date: string, title: string}[] = [
        {
            date: "November 24, 2020",
            title: "Descartes and building",
        },
        {
            date: "November 23, 2020",
            title: "Kierkegaard and learning",
        },
        {
            date: "November 22, 2020",
            title: "Merleau-Ponty time",
        },
    ];

    const testCurrentDate: string = "November 24, 2020";

    return (
        <>
            <div className="max-w-4xl relative mx-auto">
                <h1 className="up-h1">Your feed</h1>
            </div>
        </>
    )
}

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
            <Navbar/>
            <div className="max-w-7xl relative mx-auto">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="up-h1">November 24, 2020</h1>
                    <h2 className="up-h2">Descartes and building</h2>
                    <div className="prose content my-8">
                        <p>Today was at once a really cool day and a really bad one for me. Your perception of something all depends on its beginning and end, and I feel pretty terrible right now.</p>
                        <p>The highlight was probably talking to Izzy Grandic about EMM. Working with her sounds like a really amazing opportunity to build something actually impactful, and just be with someone super smart who has gone really deep into an issue.</p>
                        <p>Slightly unfortunately, I had also been charging ahead with StartupTree in the morning, saying it could be exciting to take on a market expansion project and getting a 50% raise. I fear that I'm heading towards doing too much at a time. Need to scale back and focus. Continuous re-evaluation and adjustment.</p>
                    </div>
                </div>
                <div className="absolute left-4 top-8 hidden xl:block">
                    {testDates.map((d, i) => (
                        <div
                            className={`mb-8 leading-snug ${d.date === testCurrentDate ? "" : "opacity-50 hover:opacity-100 transition"}`}
                            key={i}
                        >
                            <div className="font-bold"><span>{d.date}</span></div>
                            <div><span>{d.title}</span></div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

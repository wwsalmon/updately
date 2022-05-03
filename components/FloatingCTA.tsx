import {useState} from "react";
import {FiChevronUp, FiX} from "react-icons/fi";
import SignInButton from "./SignInButton";
import {useSession} from "next-auth/react";
import Link from "next/link";
import {useRouter} from "next/router";

export default function FloatingCta({}: {}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isHomePage = router.route === "/";

    const [isHidden, setIsHidden] = useState<boolean>(false);

    return (session || isHomePage) ? <></> : (
        <div className="fixed bottom-12 sm:bottom-4 left-4 right-4 p-3 z-20 bg-gray-50 border border-gray-300 rounded max-w-sm">
            {!isHidden && (
                <p className="mb-3">Updately is a platform for <b>sharing daily updates</b> with friends and teammates.</p>
            )}
            <div className="flex items-center">
                {isHidden ? (
                    <p className="truncate text-sm">Social platform for daily updates</p>
                ) : (
                    <>
                        <SignInButton className="small"/>
                        <Link href="/"><a className="text-sm ml-4">More info</a></Link>
                    </>
                )}
                <button onClick={() => setIsHidden(!isHidden)} className="text-sm ml-auto">
                    {isHidden ? (
                        <FiChevronUp/>
                    ) : (
                        <FiX/>
                    )}
                </button>
            </div>
        </div>
    );
}
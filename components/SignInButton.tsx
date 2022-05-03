import {signIn} from "next-auth/react";
import {FaGoogle} from "react-icons/fa";

export default function SignInButton({className}: {className?: string}) {
    return (
        <button
            className={`up-button primary ${className || ""}`}
            onClick={() => signIn('google')}
        >
            <div className="flex items-center">
                <FaGoogle/><span className="ml-2">Sign in</span>
            </div>
        </button>
    );
}
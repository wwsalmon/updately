import { useRouter } from "next/router";

export default function UserProfile() {
    const router = useRouter();
    const { username } = router.query;

    return (
        <p>{username}</p>
    )
}
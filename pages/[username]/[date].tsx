import { useRouter } from "next/router";

export default function UserProfile() {
    const router = useRouter();
    const { username, date } = router.query;

    return (
        <p>{username} {date}</p>
    )
}
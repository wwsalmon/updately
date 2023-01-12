
import axios from "axios";
import {Dispatch, ReactNode, SetStateAction, useState} from "react";
import ReactModal from "react-modal";
import {useRouter} from "next/router";
import {Update} from "../utils/types";
import {useTheme} from "next-themes";

export default function Modal({isOpen, setIsOpen, children, wide = false}: {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    children: ReactNode,
    wide?: boolean,
}) {
    const modalClasses = "top-24 left-1/2 fixed bg-white dark:bg-gray-900 p-4 rounded-md shadow-xl mx-4 overflow-y-auto";
    const {theme} = useTheme();
    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            className={modalClasses}
            style={{content: {transform: "translateX(calc(-50% - 16px))", maxWidth: "calc(100% - 32px)", maxHeight: "calc(100vh - 200px)", width: wide ? 700 : 320}, overlay: {zIndex: 50, backgroundColor: theme === "light" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}}}
        >
            {children}
        </ReactModal>
    );
}

export function DeleteModal({isOpen, setIsOpen, thisUpdate, userUrlName}: {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    thisUpdate: Update,
    userUrlName: string,
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function handleDelete() {
        setIsLoading(true);
        axios.delete("/api/update", {data: {id: thisUpdate._id}})
            .then(() => router.push("/@" + userUrlName))
            .catch(e => console.log(e))
            .finally(() => setIsLoading(false))
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <p>Are you sure you want to delete this update? This action cannot be undone.</p>
            <div className="flex items-center mt-2 justify-center gap-4">
                <button
                    className="up-button text block"
                    onClick={() => setIsOpen(false)}
                >
                    Cancel
                </button>
                <button
                    className="up-button primary small relative block"
                    onClick={handleDelete}
                >
                    <span className={isLoading && "invisible"}>Delete</span>
                    {isLoading && (
                        <div className="up-spinner"/>
                    )}
                </button>
            </div>
        </Modal>
    )
}
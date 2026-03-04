import { useContext } from "react";
import { VideoCallContext } from "./VideoCallContext";

export function useVideoCall() {
    const ctx = useContext(VideoCallContext);
    if (!ctx) throw new Error("useVideoCall must be used inside VideoCallProvider");
    return ctx;
}

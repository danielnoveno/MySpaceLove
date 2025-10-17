/// <reference types="vite/client" />

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
        JitsiMeetExternalAPI: any;
    }
}
export {};

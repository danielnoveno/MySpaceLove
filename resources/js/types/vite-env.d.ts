/// <reference types="vite/client" />

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
        JitsiMeetExternalAPI: any;
    }
}
export {};

declare module "*.png?inline" {
    const content: string;
    export default content;
}

declare module "*.svg?inline" {
    const content: string;
    export default content;
}

import { Head, usePage, router } from "@inertiajs/react";
import { JitsiMeeting, JaaSMeeting } from '@jitsi/react-sdk';
import { PageProps } from "@/types";
import { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  spaceId: number;
  space?: {
    id: number;
    slug: string;
    title: string;
  };
    user: string;
}

export default function Room({ spaceId, space, user }: Props) {
  const { props } = usePage<PageProps>();
  const currentSpace = props.currentSpace;
  const resolvedSpaceSlug = space?.slug ?? currentSpace?.slug ?? `space-${spaceId}`;
  
  const [jwt, setJwt] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    router.visit(`/spaces/${resolvedSpaceSlug}/dashboard`);
  };

  useEffect(() => {
    const fetchToken = async () => {
        try {
            const response = await axios.get(`/api/spaces/${resolvedSpaceSlug}/jaas/token`);
            setJwt(response.data.token);
            setAppId(response.data.appId);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch JaaS token", err);
            setError("Failed to load video call service.");
            setLoading(false);
        }
    };
    fetchToken();
  }, [resolvedSpaceSlug]);

  if (loading) return <div className="h-screen w-full bg-gray-900 flex items-center justify-center text-white">Memuat Video Call...</div>;
  if (error) return <div className="h-screen w-full bg-gray-900 flex items-center justify-center text-red-500">{error}</div>;

  // roomName should be just the local name, JaaSMeeting will prefix it with appId
  const roomName = `LoveSpace-${resolvedSpaceSlug}`;

  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col">
      <Head title="Video Call" />
      
      <div className="flex-1 w-full relative">
        {appId && jwt ? (
        <JaaSMeeting
            appId={appId}
            roomName={roomName}
            jwt={jwt}
            configOverwrite = {{
                startWithAudioMuted: true,
                disableModeratorIndicator: true,
                startScreenSharing: true,
                enableEmailInStats: false
            }}
            interfaceConfigOverwrite = {{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
            }}
            userInfo = {{
                displayName: user,
                email: ""
            }}
            getIFrameRef = { (iframeRef) => { iframeRef.style.height = '100%'; } }
            onReadyToClose={handleClose}
        />
        ) : (
            <div className="flex items-center justify-center h-full text-white">Konfigurasi JaaS tidak valid.</div>
        )}
      </div>
    </div>
  );
}

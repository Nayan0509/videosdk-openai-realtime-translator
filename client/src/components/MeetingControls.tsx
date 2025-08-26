import { useMeeting } from "@videosdk.live/react-sdk";
import { PhoneOff, UserPlus, Copy, Check } from "lucide-react";
import useMeetingStore from "../store/meetingStore";
import toast from "react-hot-toast";
import React from "react";

interface MeetingControlsProps {
  setMeetingId: (meetingId: string | null) => void;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

const MeetingControls = ({ setMeetingId }: MeetingControlsProps) => {
  const { end, meetingId } = useMeeting();
  const { token, aiJoined, setAiJoined } = useMeetingStore();
  const [isCopied, setIsCopied] = React.useState(false);

  const inviteAI = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/join-player`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meeting_id: meetingId, token }),
      });

      if (!response.ok) throw new Error("Failed to invite AI");

      toast.success("AI Translator joined successfully");
      setAiJoined(true);
    } catch (error) {
      toast.error("Failed to invite AI Translator");
      console.error("Error inviting AI:", error);
    }
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId || "");
    setIsCopied(true);
    toast.success("Meeting ID copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const endMeeting = async () => {
    try {
      // End the OpenAI session if AI was joined
      if (aiJoined) {
        await fetch(`${API_BASE_URL}/leave-player`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        setAiJoined(false);
      }
    } catch (error) {
      console.error("Error ending AI session:", error);
      // Continue with meeting end even if AI cleanup fails
    } finally {
      // End the meeting
      end();
      setMeetingId(null);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
      <div className="max-w-md mx-auto flex items-center justify-center space-x-4">
        <button
          onClick={copyMeetingId}
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          title="Copy Meeting ID"
        >
          {isCopied ? (
            <Check className="w-6 h-6 text-green-400" />
          ) : (
            <Copy className="w-6 h-6 text-white" />
          )}
        </button>

        {!aiJoined && (
          <button
            onClick={inviteAI}
            className="p-4 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
            title="Invite AI Translator"
          >
            <UserPlus className="w-6 h-6 text-white" />
          </button>
        )}

        <button
          onClick={endMeeting}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
        >
          <PhoneOff className="w-6 h-6 text-white transform rotate-225" />
        </button>
      </div>
    </div>
  );
};

export default MeetingControls;

import axios from "axios";
import { LocalVideoTrack, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Room, RoomEvent } from "livekit-client";
import { useState } from "react";
import VideoComponent from "../components/videoComponent";
import AudioComponent from "../components/AudioComponent";

type Trackinfo = {
  trackPublications : RemoteTrackPublication,
  participantIdentity : string,
}

export default function Dashboard() {
  const [room, setRoom] = useState<Room | undefined> (undefined);
  const [localTrack, setLocalTrack] = useState<LocalVideoTrack | undefined>(undefined);
  const [remoteTracks, setRemoteTracks] = useState<Trackinfo[]>([]);
  const [participantName, setParticipantName] = useState("Participant" + Math.floor(Math.random() * 100));
  const [roomName, setRoomName] = useState("Test Room");

  const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_WSURL;

  async function getToken(roomName: string, participantName: string){

    try {
      const res = await axios.post("https://recio-backend.onrender.com/getToken", {roomName, participantId: participantName},{
        headers: {
          "Content-Type": "application/json"
        }
      })
      return res.data.token;
    } catch (error) {
        console.log("error occured bhahu", error);
    }
    
  }

  async function leaveRoom() {
        // Leave the room by calling 'disconnect' method over the Room object
        await room?.disconnect();

        // Reset the state
        setRoom(undefined);
        setLocalTrack(undefined);
        setRemoteTracks([]);
  }

  async function joinRoom(){
    const room = new Room();
    setRoom(room);

    room.on(RoomEvent.TrackSubscribed, (_track : RemoteTrack, publication: RemoteTrackPublication, partcipant: RemoteParticipant) => {
        setRemoteTracks(prev => [...prev, {trackPublications: publication, participantIdentity: partcipant.identity}])
    })

    room.on(RoomEvent.TrackUnsubscribed, (_track: RemoteTrack, publication: RemoteTrackPublication) => {
        setRemoteTracks((prev) => prev.filter((track) => track.trackPublications.trackSid !== publication.trackSid));
    });

    try{
      const token = await getToken(roomName, participantName);

      await room.connect(LIVEKIT_URL, token);
      await room.localParticipant.enableCameraAndMicrophone();
      setLocalTrack(room.localParticipant.videoTrackPublications.values().next().value?.videoTrack);

    }catch (error) {
        console.log("There was an error connecting to the room:", (error as Error).message);
        await leaveRoom();
    }

  } 

    return (
        <>
            {!room ? (
                <div id="join">
                    <div id="join-dialog">
                        <h2>Join a Video Room</h2>
                        <form
                            onSubmit={(e) => {
                                joinRoom();
                                e.preventDefault();
                            }}
                        >
                            <div>
                                <label htmlFor="participant-name">Participant</label>
                                <input
                                    id="participant-name"
                                    className="form-control"
                                    type="text"
                                    value={participantName}
                                    onChange={(e) => setParticipantName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="room-name">Room</label>
                                <input
                                    id="room-name"
                                    className="form-control"
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                className="btn btn-lg btn-success"
                                type="submit"
                                disabled={!roomName || !participantName}
                            >
                                Join!
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div id="room">
                    <div id="room-header">
                        <h2 id="room-title">{roomName}</h2>
                        <button className="btn btn-danger" id="leave-room-button" onClick={leaveRoom}>
                            Leave Room
                        </button>
                    </div>
                    <div id="layout-container">
                        {localTrack && (
                            <VideoComponent track={localTrack} participantIdentity={participantName} local={true} />
                        )}
                        {remoteTracks.map((remoteTrack) =>
                            remoteTrack.trackPublications.kind === "video" ? (
                                <VideoComponent
                                    key={remoteTrack.trackPublications.trackSid}
                                    track={remoteTrack.trackPublications.videoTrack!}
                                    participantIdentity={remoteTrack.participantIdentity}
                                />
                            ) : (
                                <AudioComponent
                                    key={remoteTrack.trackPublications.trackSid}
                                    track={remoteTrack.trackPublications.audioTrack!}
                                />
                            )
                        )}
                    </div>
                </div>
            )}
        </>
    );

  
}

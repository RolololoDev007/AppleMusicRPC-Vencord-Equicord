import { execFile } from "node:child_process";
import { promisify } from "node:util";

export interface TrackData {
    name: string;
    artist?: string;
    album?: string;
    playerPosition?: number;
    duration?: number;
}

const exec = promisify(execFile);

const APP_ID_PATTERNS = [
    /AppleInc\.AppleMusic/i,
    /AppleMusic/i,
    /iTunes/i
];

interface RawSession {
    appId?: string;
    title?: string;
    artist?: string;
    album?: string;
    positionSeconds?: number;
    durationSeconds?: number;
    playbackStatus?: string;
}

async function readSessions(): Promise<RawSession[]> {
    const script = `
Add-Type -AssemblyName System.Runtime.WindowsRuntime | Out-Null
$null = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType=WindowsRuntime]
$mgr = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync().GetAwaiter().GetResult()

$sessions = foreach ($s in $mgr.GetSessions()) {
  try {
    $props = $s.TryGetMediaPropertiesAsync().GetAwaiter().GetResult()
    $timeline = $s.GetTimelineProperties()
    $playback = $s.GetPlaybackInfo()

    [PSCustomObject]@{
      appId = $s.SourceAppUserModelId
      title = $props.Title
      artist = $props.Artist
      album = $props.AlbumTitle
      positionSeconds = ($timeline.Position.TotalSeconds)
      durationSeconds = ($timeline.EndTime.TotalSeconds)
      playbackStatus = $playback.PlaybackStatus.ToString()
    }
  } catch {}
}

$sessions | ConvertTo-Json -Compress
`;

    const { stdout } = await exec("powershell.exe", ["-NoProfile", "-Command", script], {
        windowsHide: true,
        maxBuffer: 1024 * 1024
    });

    const text = stdout.trim();
    if (!text) return [];

    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
}

function normalizeTrack(session: RawSession): TrackData | null {
    if (!session.title || session.playbackStatus?.toLowerCase() !== "playing") return null;

    return {
        name: session.title,
        artist: session.artist,
        album: session.album,
        playerPosition: typeof session.positionSeconds === "number" ? session.positionSeconds : undefined,
        duration: typeof session.durationSeconds === "number" ? session.durationSeconds : undefined
    };
}

export async function fetchTrackData(): Promise<TrackData | null> {
    try {
        const sessions = await readSessions();
        const target = sessions.find(s => APP_ID_PATTERNS.some(pattern => pattern.test(s.appId ?? "")));
        if (!target) return null;

        return normalizeTrack(target);
    } catch {
        return null;
    }
}

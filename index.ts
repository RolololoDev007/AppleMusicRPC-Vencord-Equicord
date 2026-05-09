import { definePluginSettings } from "@api/Settings";
import { IS_WIN } from "@utils/constants";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { FluxDispatcher } from "@webpack/common";

const Native = VencordNative.pluginHelpers.AppleMusicWindowsRpc as PluginNative<typeof import("./native")>;

interface Activity {
    application_id: string;
    name: string;
    details?: string;
    state?: string;
    timestamps?: {
        start?: number;
        end?: number;
    };
    type: number;
    flags: number;
}

interface TrackData {
    name: string;
    artist?: string;
    album?: string;
    playerPosition?: number;
    duration?: number;
}

const enum ActivityType {
    Playing = 0,
    Listening = 2
}

const enum ActivityFlag {
    Instance = 1 << 0
}

const applicationId = "1239490006054207550";

const settings = definePluginSettings({
    refreshInterval: {
        type: OptionType.SLIDER,
        description: "Intervalo de refresco (segundos)",
        markers: [1, 2, 3, 5, 10, 15],
        default: 3,
        restartNeeded: true
    },
    activityType: {
        type: OptionType.SELECT,
        description: "Tipo de actividad",
        options: [
            { label: "Playing", value: ActivityType.Playing },
            { label: "Listening", value: ActivityType.Listening, default: true }
        ]
    },
    enableTimestamps: {
        type: OptionType.BOOLEAN,
        description: "Mostrar timestamps",
        default: true
    },
    detailsString: {
        type: OptionType.STRING,
        description: "Formato de linea principal",
        default: "{name}"
    },
    stateString: {
        type: OptionType.STRING,
        description: "Formato de linea secundaria",
        default: "{artist} - {album}"
    }
});

function setActivity(activity: Activity | null) {
    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity,
        socketId: "AppleMusicWindowsRpc"
    });
}

function format(template: string, track: TrackData): string {
    return template
        .replaceAll("{name}", track.name ?? "")
        .replaceAll("{artist}", track.artist ?? "")
        .replaceAll("{album}", track.album ?? "")
        .replace(/\s+-\s+$/, "")
        .trim();
}

function makeActivity(track: TrackData): Activity {
    const details = format(settings.store.detailsString, track) || track.name;
    const state = format(settings.store.stateString, track) || undefined;

    const hasTiming =
        settings.store.enableTimestamps &&
        typeof track.playerPosition === "number" &&
        typeof track.duration === "number" &&
        Number.isFinite(track.playerPosition) &&
        Number.isFinite(track.duration) &&
        track.duration > 0;

    return {
        application_id: applicationId,
        name: "Apple Music",
        details,
        state,
        timestamps: hasTiming
            ? {
                  start: Date.now() - track.playerPosition * 1000,
                  end: Date.now() - track.playerPosition * 1000 + track.duration * 1000
              }
            : undefined,
        type: settings.store.activityType,
        flags: ActivityFlag.Instance
    };
}

export default definePlugin({
    name: "AppleMusicWindowsRpc",
    description: "Rich Presence de Apple Music para Windows.",
    authors: [{ name: "expot", id: 0n }],
    hidden: !IS_WIN,
    settings,

    start() {
        this.updatePresence();
        this.interval = setInterval(() => this.updatePresence(), settings.store.refreshInterval * 1000);
    },

    stop() {
        clearInterval(this.interval);
        setActivity(null);
    },

    async updatePresence() {
        try {
            const track = await Native.fetchTrackData();
            setActivity(track ? makeActivity(track) : null);
        } catch {
            setActivity(null);
        }
    }
});

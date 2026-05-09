# AppleMusicWindowsRpc for Equicord

Apple Music Rich Presence for **Equicord on Windows**.

This plugin shows what you're listening to in Apple Music directly in Discord, including:
- Track title
- Artist and album
- Playback timestamps/progress
- Album artwork
- Proper UTF-8 support (accents, special characters)

## Features

- Real-time Apple Music/iTunes detection via Windows SMTC media sessions
- Discord local Rich Presence updates
- Automatic album cover fetching
- Customizable text templates (`{name}`, `{artist}`, `{album}`)
- Configurable refresh interval

## Requirements

- Windows 10/11
- Apple Music for Windows (or iTunes)
- Equicord **built from source** (user plugins require a build)
- Node.js
- `pnpm`

## Installation

### 1) Clone Equicord (if you don't already have it)

```powershell
git clone https://github.com/Equicord/Equicord.git
cd Equicord
```

### 2) Copy this plugin into `src/userplugins/`

Final structure:

```text
src/userplugins/appleMusicWindowsRpc/
  index.ts
  native.ts
  README.md
```

### 3) Install dependencies and build

```powershell
pnpm install
pnpm build
```

### 4) Inject and restart Discord

```powershell
pnpm inject
```

Fully close Discord (including system tray), then open it again.

### 5) Enable the plugin

`Settings -> Plugins -> AppleMusicWindowsRpc`

## Configuration

Plugin settings let you customize:

- **Activity Type**: `Playing` or `Listening`
- **Refresh Interval**
- **Details String** (example: `{name}`)
- **State String** (example: `{artist} - {album}`)
- **Timestamps** on/off

## Screenshots

Add your screenshots here:

```md
<img width="351" height="527" alt="image" src="https://github.com/user-attachments/assets/9afc045e-a254-4349-9265-b6cc3fe87c70" />

```

## Troubleshooting

### Plugin does not appear

- Confirm folder path: `src/userplugins/appleMusicWindowsRpc/`
- Confirm entry file name is exactly `index.ts`
- Run `pnpm build` again
- Fully restart Discord

### Song is not detected

- Make sure Apple Music is actually playing (not paused)
- Ensure you're running the same Equicord build where this plugin was added
- Run `pnpm inject` again

### Broken accents / special characters

This plugin already uses robust UTF-8 transport for PowerShell -> plugin communication.
If text still looks wrong, rebuild and reinject:

```powershell
pnpm build
pnpm inject
```

## Contributing

PRs are welcome: artwork improvements, performance tweaks, new formatting options, etc.

## Credits

- Built on top of the Equicord/Vencord plugin architecture
- Windows SMTC + RPC implementation by @expot

## License

MIT (recommended for maximum adoption)

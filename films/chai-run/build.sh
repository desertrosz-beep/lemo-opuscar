#!/bin/sh
# One command: picture → SFX mix (over the user's track) → mux + loudness → chai-run.mp4
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
[ -f "$HERE/music.mp3" ] || { echo "put chai_run_music_edit.mp3 here as music.mp3"; exit 1; }
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs "$HERE" --fps 24 --workers 6 --size 1080x1920 --out "$HERE/out/video.mp4"
"$LIB/.venv/bin/python" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/chai-run.mp4" 24 1
"$LIB/.venv/bin/python" core/render/srt.py "$HERE/cues.json" "$HERE/chai-run.srt"

#!/bin/sh
# Rebuild "Five Lamps" from scratch: sh films/diwali-five-lights/build.sh (from anywhere)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
PY="$LIB/.venv/bin/python"
"$PY" core/tts/tts.py "$HERE/lines.json" "$HERE/voices"                         # 1. narration (Kokoro af_heart, 0.88)
"$PY" core/tts/asr_check.py "$HERE/lines.json" "$HERE/voices" || echo "! asr_check failed (needs the Whisper model from huggingface.co)"
node core/render/events.mjs "$HERE"                                              # 2. timeline → events.json
"$PY" "$HERE/score.py"                                                           # 3. score (needs: sh tools/fetch.sh instruments vsco2ce)
"$PY" "$HERE/mix.py"                                                             # 4. foley + voice + ducked score → out/mix.wav
"$PY" "$HERE/cues.py" && "$PY" core/render/srt.py "$HERE/out/cues.json" "$HERE/diwali-five-lights.srt"   # 5. subtitles
node core/render/video.mjs "$HERE" --fps 24 --workers 3 --out "$HERE/out/video.mp4"                      # 6. picture
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/diwali-five-lights.mp4" 24 2      # 7. mux, −14 LUFS
"$PY" "$HERE/stills.py"                                                          # 8. poster.jpg + thumbnail.jpg

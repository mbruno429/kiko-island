#!/usr/bin/env bash
# Makes the spoken Tagalog word clips in src/voice/ with the eSpeak NG synthesizer.
# Needs espeak-ng and ffmpeg. Run from the repo root:  bash scripts/make-voice.sh
#
# eSpeak NG has no Tagalog voice, and its Indonesian voice stresses every word on the
# second-to-last syllable, which is wrong for words like "maganda" (stress on the last).
# So each word is written out as sounds, using eSpeak's Indonesian sound set:
#   '  the stressed syllable      :  a long vowel
#   *  the tapped r               ?  the glottal stop (as at the end of "isda")
#   N  ng                         j  y
# To see exactly what will be said:  espeak-ng -v id -q --ipa "[[isd'a?]]"
set -euo pipefail

VOICE="id+f5" # Indonesian sounds, in eSpeak's clearest higher-pitched voice
SPEED=125     # words per minute: slow enough for small children

out=src/voice
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$out"

while IFS='|' read -r id sounds; do
  [ -n "$id" ] || continue
  espeak-ng -v "$VOICE" -s "$SPEED" -w "$tmp/$id.wav" "[[$sounds]]" </dev/null
  # Trim the silence at both ends.
  trim="silenceremove=start_periods=1:start_threshold=-45dB:detection=peak"
  ffmpeg -nostdin -v error -y -i "$tmp/$id.wav" -af "$trim,areverse,$trim,areverse" "$tmp/$id.trim.wav"
  # Bring every clip to the same peak level, soften the edges, pad the end a touch.
  peak=$(ffmpeg -nostdin -hide_banner -i "$tmp/$id.trim.wav" -af volumedetect -f null - 2>&1 | sed -n 's/.*max_volume: \(-\{0,1\}[0-9.]*\) dB.*/\1/p')
  gain=$(awk -v p="$peak" 'BEGIN { printf "%.1f", -1.5 - p }')
  len=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$tmp/$id.trim.wav" </dev/null)
  fade=$(awk -v l="$len" 'BEGIN { printf "%.3f", l - 0.03 }')
  ffmpeg -nostdin -v error -y -i "$tmp/$id.trim.wav" \
    -af "volume=${gain}dB,afade=t=in:d=0.005,afade=t=out:st=${fade}:d=0.03,apad=pad_dur=0.05" \
    -ar 44100 -ac 1 -c:a libmp3lame -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact "$out/$id.mp3"
  printf '%-12s %-18s %ss\n' "$id" "$sounds" "$len"
done <<'WORDS'
kumusta|kumust'a
mabuhay|mab'u:haj
salamat|sal'a:mat
maganda|magand'a
magaling|magal'iN
araw|'a:*aw
ulap|'u:lap
niyog|nij'og
isda|isd'a?
bituin|bitu?'in
bangka|baNk'a?
bahay-kubo|b'a:haj k'u:bo
bulaklak|bulakl'ak
bulkan|bulk'an
WORDS

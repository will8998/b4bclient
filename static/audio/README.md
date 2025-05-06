# Audio Files for CyberpunkHUD

This directory contains audio files used by the CyberpunkHUD component.

## Required Files

1. **calm.mp3** - Background music for normal mode
   - Should be a calm, ambient electronic track
   - Recommended length: 2-5 minutes (will loop)
   - Recommended bitrate: 128-192 kbps

2. **anxiety.mp3** - Background music for anxiety mode
   - Should be a faster, more intense electronic track
   - Consider tracks with faster BPM, distortion, or glitchy elements
   - Recommended length: 2-5 minutes (will loop)
   - Recommended bitrate: 128-192 kbps

3. **click-sound.mp3** - Sound effect for button clicks
   - Should be a short, cyberpunk-style click/beep sound
   - Recommended length: 0.1-0.5 seconds
   - Recommended bitrate: 128-192 kbps

## Notes

- These placeholder files need to be replaced with actual audio files
- The application automatically handles audio playback, fading between tracks, and volume control
- Audio will only start after the first user interaction with the page (browser requirement)
- Volume levels can be adjusted in the CyberpunkHUD.svelte component 
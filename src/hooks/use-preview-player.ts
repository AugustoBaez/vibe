import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useRef } from 'react';

/**
 * Loads a remote preview and starts it as soon as the player is ready.
 * Tap `toggle` to pause or resume; the clip loops while the screen is open.
 */
export function usePreviewPlayer(previewUrl: string) {
  const source = previewUrl.trim() || null;
  const player = useAudioPlayer(source, { downloadFirst: true });
  const status = useAudioPlayerStatus(player);
  const autoplayed = useRef(false);
  const lastSource = useRef(source);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
    });
  }, []);

  useEffect(() => {
    if (lastSource.current === source) return;
    lastSource.current = source;
    autoplayed.current = false;

    if (source) {
      player.replace(source);
      player.loop = true;
      return;
    }

    player.pause();
  }, [player, source]);

  useEffect(() => {
    if (!source) return;
    player.loop = true;
  }, [player, source]);

  useEffect(() => {
    if (!source || !status.isLoaded || autoplayed.current) return;
    autoplayed.current = true;
    player.play();
  }, [player, source, status.isLoaded]);

  function toggle() {
    if (!source) return;

    if (status.playing) {
      player.pause();
      return;
    }

    if (status.didJustFinish) {
      player.seekTo(0);
    }

    player.play();
  }

  return {
    available: Boolean(source),
    playing: status.playing,
    toggle,
  };
}

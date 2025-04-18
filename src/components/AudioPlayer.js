import React, { useState, useRef, useEffect } from 'react';
import '../styles/App.css';

const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [filterApplied, setFilterApplied] = useState(null);
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const audioElementRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const delayNodeRef = useRef(null);
  const feedbackGainRef = useRef(null);
  const speedIntervalRef = useRef(null);

  const audioFilters = [
    {
      name: 'Normal',
      apply: (_, src) => src,
    },
    {
      name: 'Echo',
      apply: (ctx, src) => {
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.3;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.2;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.5;
        delayNodeRef.current = delay;
        feedbackGainRef.current = feedback;
        src.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(filter);
        filter.connect(ctx.destination);
        audioElementRef.current.addEventListener(
          'ended',
          () => {
            if (feedbackGainRef.current) feedbackGainRef.current.gain.value = 0;
            setTimeout(() => {
              if (delayNodeRef.current) delayNodeRef.current.disconnect();
            }, 500);
          },
          { once: true },
        );
        return src;
      },
    },
    {
      name: 'Tremolo',
      apply: (ctx, src) => {
        const tremoloGain = ctx.createGain();
        tremoloGain.gain.value = 1;
        const depth = ctx.createGain();
        depth.gain.value = 0.6;
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 8;
        lfo.connect(depth).connect(tremoloGain.gain);
        lfo.start();
        src.connect(tremoloGain).connect(ctx.destination);
        return { noiseNode: lfo, noiseGain: depth, disconnect: () => tremoloGain.disconnect() };
      },
    },
    {
      name: 'High Pitch',
      apply: (ctx, src) => {
        const f1 = ctx.createBiquadFilter();
        f1.type = 'highshelf';
        f1.frequency.value = 800;
        f1.gain.value = 15;
        const f2 = ctx.createBiquadFilter();
        f2.type = 'peaking';
        f2.frequency.value = 1200;
        f2.Q.value = 1;
        f2.gain.value = 8;
        src.connect(f1);
        f1.connect(f2);
        f2.connect(ctx.destination);
        return src;
      },
    },
    {
      name: 'Low Pitch',
      apply: (ctx, src) => {
        const f1 = ctx.createBiquadFilter();
        f1.type = 'lowshelf';
        f1.frequency.value = 100;
        f1.gain.value = 20;
        const f2 = ctx.createBiquadFilter();
        f2.type = 'peaking';
        f2.frequency.value = 80;
        f2.Q.value = 1.5;
        f2.gain.value = 12;
        const f3 = ctx.createBiquadFilter();
        f3.type = 'lowpass';
        f3.frequency.value = 200;
        f3.Q.value = 0.7;
        src.connect(f1);
        f1.connect(f2);
        f2.connect(f3);
        f3.connect(ctx.destination);
        return src;
      },
    },
    {
      name: 'Fast Speed',
      apply: (_, src) => {
        audioElementRef.current.playbackRate = 1.5;
        src.connect(audioContextRef.current.destination);
        return src;
      },
    },
    {
      name: 'Variable Speed',
      apply: (_, src) => {
        audioElementRef.current.playbackRate = 1.0;
        let speedUp = true;
        let currentSpeed = 1.0;
        speedIntervalRef.current = setInterval(() => {
          if (speedUp) {
            currentSpeed += 0.1;
            if (currentSpeed >= 1.5) speedUp = false;
          } else {
            currentSpeed -= 0.1;
            if (currentSpeed <= 0.8) speedUp = true;
          }
          audioElementRef.current.playbackRate = currentSpeed;
        }, 1000);
        audioElementRef.current.addEventListener(
          'ended',
          () => {
            if (speedIntervalRef.current) {
              clearInterval(speedIntervalRef.current);
              speedIntervalRef.current = null;
            }
          },
          { once: true },
        );
        src.connect(audioContextRef.current.destination);
        return src;
      },
    },
  ];

  const getRandomFilter = () =>
    audioFilters[Math.floor(Math.random() * audioFilters.length)];

  const cleanupResources = () => {
    try {
      if (sourceNodeRef.current?.disconnect) sourceNodeRef.current.disconnect();
      if (gainNodeRef.current?.disconnect) gainNodeRef.current.disconnect();
      if (delayNodeRef.current?.disconnect) delayNodeRef.current.disconnect();
      if (feedbackGainRef.current?.disconnect)
        feedbackGainRef.current.disconnect();
      if (filterNodeRef.current) {
        if (filterNodeRef.current.disconnect)
          filterNodeRef.current.disconnect();
        if (filterNodeRef.current.noiseNode?.disconnect)
          filterNodeRef.current.noiseNode.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed')
        audioContextRef.current.close();
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
        speedIntervalRef.current = null;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const initAudio = () => {
    if (!audioUrl) {
      setError('No audio URL provided');
      return;
    }
    try {
      cleanupResources();
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      audioElementRef.current = new Audio();
      let full = audioUrl;
      if (!full.startsWith('/audio/')) full = `/audio/${full}`;
      if (!full.startsWith('/')) full = `/${full}`;
      audioElementRef.current.src = full;
      audioElementRef.current.crossOrigin = 'anonymous';
      audioElementRef.current.addEventListener('error', e =>
        setError(`Error loading audio file: ${e.target.error?.message || ''}`),
      );
      audioElementRef.current.addEventListener('ended', () =>
        setIsPlaying(false),
      );
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(
        audioElementRef.current,
      );
      gainNodeRef.current = audioContextRef.current.createGain();
      sourceNodeRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      const rnd = getRandomFilter();
      setFilterApplied(rnd);
      filterNodeRef.current = rnd.apply(
        audioContextRef.current,
        sourceNodeRef.current,
      );
      setError(null);
    } catch (e) {
      setError(`Error initializing audio: ${e.message}`);
    }
  };

  useEffect(() => {
    if (audioUrl) initAudio();
    return cleanupResources;
  }, [audioUrl]);

  useEffect(() => {
    setHasPlayed(false);
    setIsPlaying(false);
    setError(null);
  }, [audioUrl]);

  const playAudio = () => {
    if (hasPlayed || !audioElementRef.current || !audioContextRef.current)
      return;
    try {
      if (audioContextRef.current.state === 'suspended')
        audioContextRef.current.resume();
      audioElementRef.current.play();
      if (
        filterApplied?.name === 'Tremolo' &&
        filterNodeRef.current?.noiseGain
      )
        filterNodeRef.current.noiseGain.gain.value = 0.6;
      setIsPlaying(true);
      setHasPlayed(true);
    } catch (e) {
      setError(`Error playing audio: ${e.message}`);
    }
  };

  return (
    <div className="audio-player">
      <button
        onClick={playAudio}
        disabled={hasPlayed || error}
        className={hasPlayed ? 'played' : ''}
      >
        {hasPlayed ? 'Played' : 'Play'}
      </button>
      {filterApplied && (
        <div className="filter-info">Filter applied: {filterApplied.name}</div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AudioPlayer;

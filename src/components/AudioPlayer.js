import React, { useState, useRef, useEffect } from 'react';
import '../styles/App.css';

const AudioPlayer = ({ audioUrl }) => {
  const [hasPlayed, setHasPlayed] = useState(false);
  const [filterApplied, setFilterApplied] = useState(null);
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
      apply: (audioContext, sourceNode) => {
        
        return sourceNode;
      }
    },
    {
      name: 'Echo',
      apply: (audioContext, sourceNode) => {
       
        const delay = audioContext.createDelay();
        delay.delayTime.value = 0.3; 
        
        
        const feedback = audioContext.createGain();
        feedback.gain.value = 0.2; 
        
       
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.5;
        
       
        delayNodeRef.current = delay;
        feedbackGainRef.current = feedback;
        
 
        sourceNode.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(filter);
        filter.connect(audioContext.destination);
        
        
        audioElementRef.current.addEventListener('ended', () => {
          
          if (feedbackGainRef.current) {
            feedbackGainRef.current.gain.value = 0;
          }
          
          
          setTimeout(() => {
            if (delayNodeRef.current) {
              delayNodeRef.current.disconnect();
            }
          }, 500);
        }, { once: true });
        
        return sourceNode;
      }
    },
    {
      name: 'Noise',
      apply: (audioContext, sourceNode) => {
        const noiseNode = audioContext.createScriptProcessor(4096, 1, 1);
        noiseNode.onaudioprocess = (e) => {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < output.length; i++) {
            output[i] = output[i] + (Math.random() * 0.1 - 0.05);
          }
        };
        
        sourceNode.connect(noiseNode);
        noiseNode.connect(audioContext.destination);
        
        return sourceNode;
      }
    },
    {
      name: 'High Pitch',
      apply: (audioContext, sourceNode) => {
        // Tạo bộ lọc highshelf với tần số cao hơn và gain lớn hơn
        const filter = audioContext.createBiquadFilter();
        filter.type = 'highshelf';
        filter.frequency.value = 800; // Giảm tần số để tăng cường hiệu ứng
        filter.gain.value = 15; // Tăng gain từ 10 lên 15
        
        // Tạo bộ lọc thứ hai để tăng cường hiệu ứng
        const filter2 = audioContext.createBiquadFilter();
        filter2.type = 'peaking';
        filter2.frequency.value = 1200;
        filter2.Q.value = 1;
        filter2.gain.value = 8;
        
        // Kết nối các node
        sourceNode.connect(filter);
        filter.connect(filter2);
        filter2.connect(audioContext.destination);
        
        return sourceNode;
      }
    },
    {
      name: 'Low Pitch',
      apply: (audioContext, sourceNode) => {
        // Tạo bộ lọc lowshelf với tần số thấp hơn và gain lớn hơn
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowshelf';
        filter.frequency.value = 100; // Giảm tần số từ 150 xuống 100
        filter.gain.value = 20; // Tăng gain từ 15 lên 20
        
        // Tạo bộ lọc thứ hai để tăng cường hiệu ứng
        const filter2 = audioContext.createBiquadFilter();
        filter2.type = 'peaking';
        filter2.frequency.value = 80; // Giảm tần số từ 100 xuống 80
        filter2.Q.value = 1.5; // Tăng Q từ 1 lên 1.5
        filter2.gain.value = 12; // Tăng gain từ 8 lên 12
        
        // Tạo bộ lọc thứ ba để tăng cường âm trầm
        const filter3 = audioContext.createBiquadFilter();
        filter3.type = 'lowpass';
        filter3.frequency.value = 200; // Thêm bộ lọc lowpass để cắt bớt tần số cao
        filter3.Q.value = 0.7;
        
        // Kết nối các node
        sourceNode.connect(filter);
        filter.connect(filter2);
        filter2.connect(filter3);
        filter3.connect(audioContext.destination);
        
        return sourceNode;
      }
    },
    {
      name: 'Fast Speed',
      apply: (audioContext, sourceNode) => {
        // Tăng tốc độ phát âm thanh lên 1.5x
        audioElementRef.current.playbackRate = 1.5;
        
        // Kết nối source node với destination
        sourceNode.connect(audioContext.destination);
        
        return sourceNode;
      }
    },
    {
      name: 'Variable Speed',
      apply: (audioContext, sourceNode) => {
        // Bắt đầu với tốc độ bình thường
        audioElementRef.current.playbackRate = 1.0;
        
        // Biến để theo dõi hướng thay đổi tốc độ
        let speedUp = true;
        let currentSpeed = 1.0;
        
        // Tạo interval để thay đổi tốc độ
        speedIntervalRef.current = setInterval(() => {
          if (speedUp) {
            // Tăng tốc độ
            currentSpeed += 0.1;
            if (currentSpeed >= 1.5) {
              speedUp = false;
            }
          } else {
            // Giảm tốc độ
            currentSpeed -= 0.1;
            if (currentSpeed <= 0.8) {
              speedUp = true;
            }
          }
          
          // Áp dụng tốc độ mới
          audioElementRef.current.playbackRate = currentSpeed;
        }, 1000); // Thay đổi mỗi giây
        
        // Thêm sự kiện khi audio kết thúc để dừng interval
        audioElementRef.current.addEventListener('ended', () => {
          if (speedIntervalRef.current) {
            clearInterval(speedIntervalRef.current);
            speedIntervalRef.current = null;
          }
        }, { once: true });
        
        // Kết nối source node với destination
        sourceNode.connect(audioContext.destination);
        
        return sourceNode;
      }
    }
  ];

  
  const getRandomFilter = () => {
    const randomIndex = Math.floor(Math.random() * audioFilters.length);
    return audioFilters[randomIndex];
  };

  
  const initAudio = () => {
    try {
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      // Tạo audio element
      audioElementRef.current = new Audio();
      
      
      audioElementRef.current.src = audioUrl;
      
      // Thêm thuộc tính crossorigin
      audioElementRef.current.crossOrigin = "anonymous";
      
      // Tạo source node
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
      
      // Tạo gain node để điều chỉnh âm lượng
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 1.0;
      
      // Kết nối source node với gain node
      sourceNodeRef.current.connect(gainNodeRef.current);
      
      // Kết nối gain node với destination
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      // Áp dụng bộ lọc ngẫu nhiên
      const randomFilter = getRandomFilter();
      setFilterApplied(randomFilter);
      
      // Áp dụng bộ lọc
      filterNodeRef.current = randomFilter.apply(audioContextRef.current, sourceNodeRef.current);
      
      // Thêm sự kiện khi audio kết thúc
      audioElementRef.current.addEventListener('ended', () => {
        setHasPlayed(false);
      });
      
      console.log('Audio initialized successfully');
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  };

  // Khởi tạo audio khi component mount
  useEffect(() => {
    initAudio();
    
    // Cleanup function
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      // Dừng interval nếu có
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
        speedIntervalRef.current = null;
      }
    };
  }, [audioUrl]);

  // Reset trạng thái khi audioUrl thay đổi
  useEffect(() => {
    setHasPlayed(false);
  }, [audioUrl]);

  // Hàm phát âm thanh
  const playAudio = () => {
    if (!hasPlayed && audioElementRef.current && audioContextRef.current) {
      try {
        // Đảm bảo audio context đang hoạt động
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        
        // Phát âm thanh
        audioElementRef.current.play();
        setHasPlayed(true);
        
        console.log('Playing audio with filter:', filterApplied.name);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  return (
    <div className="audio-player">
      <button 
        onClick={playAudio} 
        disabled={hasPlayed}
        className={hasPlayed ? 'played' : ''}
      >
        {hasPlayed ? 'Played' : 'Play'}
      </button>
      {filterApplied && (
        <div className="filter-info">
          Filter applied: {filterApplied.name}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;

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

  // Định nghĩa các bộ lọc âm thanh
  const audioFilters = [
    {
      name: 'Normal',
      apply: (audioContext, sourceNode) => {
        // Không áp dụng bộ lọc nào
        return sourceNode;
      }
    },
    {
      name: 'Echo',
      apply: (audioContext, sourceNode) => {
        // Tạo delay node với thời gian delay ngắn hơn
        const delay = audioContext.createDelay();
        delay.delayTime.value = 0.3; // Giảm thời gian delay từ 0.5 xuống 0.3
        
        // Tạo feedback gain với giá trị nhỏ hơn
        const feedback = audioContext.createGain();
        feedback.gain.value = 0.2; // Giảm feedback từ 0.3 xuống 0.2
        
        // Tạo filter để làm mềm âm thanh echo
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.5;
        
        // Lưu trữ các node để có thể dừng chúng sau này
        delayNodeRef.current = delay;
        feedbackGainRef.current = feedback;
        
        // Kết nối các node
        sourceNode.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(filter);
        filter.connect(audioContext.destination);
        
        // Thêm sự kiện khi audio kết thúc để dừng echo
        audioElementRef.current.addEventListener('ended', () => {
          // Dừng feedback loop
          if (feedbackGainRef.current) {
            feedbackGainRef.current.gain.value = 0;
          }
          
          // Dừng delay sau một khoảng thời gian ngắn
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

  // Hàm lấy bộ lọc ngẫu nhiên
  const getRandomFilter = () => {
    const randomIndex = Math.floor(Math.random() * audioFilters.length);
    return audioFilters[randomIndex];
  };

  // Hàm dọn dẹp tài nguyên
  const cleanupResources = () => {
    try {
      // Dừng interval nếu có
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
        speedIntervalRef.current = null;
      }
      
      // Ngắt kết nối các node
      if (delayNodeRef.current) {
        delayNodeRef.current.disconnect();
        delayNodeRef.current = null;
      }
      
      if (feedbackGainRef.current) {
        feedbackGainRef.current.disconnect();
        feedbackGainRef.current = null;
      }
      
      if (filterNodeRef.current) {
        filterNodeRef.current.disconnect();
        filterNodeRef.current = null;
      }
      
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      
      // Dừng và xóa audio element
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        // Không xóa src để tránh lỗi Empty src attribute
        // audioElementRef.current.src = '';
        audioElementRef.current = null;
      }
      
      // Đóng audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  // Khởi tạo audio context và audio element
  const initAudio = () => {
    // Kiểm tra audioUrl
    if (!audioUrl) {
      setError('No audio URL provided');
      return;
    }
    
    try {
      // Dọn dẹp tài nguyên cũ nếu có
      cleanupResources();
      
      // Tạo audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Tạo audio element
      audioElementRef.current = new Audio();
      
      // Xử lý đường dẫn audio
      let fullAudioUrl = audioUrl;
      
      // Nếu đường dẫn không bắt đầu bằng /audio/, thêm vào
      if (!fullAudioUrl.startsWith('/audio/')) {
        fullAudioUrl = `/audio/${fullAudioUrl}`;
      }
      
      // Nếu đường dẫn không bắt đầu bằng /, thêm vào
      if (!fullAudioUrl.startsWith('/')) {
        fullAudioUrl = `/${fullAudioUrl}`;
      }
      
      console.log('Loading audio from:', fullAudioUrl);
      
      // Thiết lập src cho audio element
      audioElementRef.current.src = fullAudioUrl;
      
      // Kiểm tra lại src đã được thiết lập
      if (!audioElementRef.current.src || audioElementRef.current.src === '') {
        console.error('Failed to set audio src');
        setError('Error: Failed to set audio source');
        return;
      }
      
      // Thêm thuộc tính crossorigin
      audioElementRef.current.crossOrigin = "anonymous";
      
      // Thêm sự kiện lỗi trước khi tạo source node
      audioElementRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        const errorMessage = e.target.error ? e.target.error.message : 'Unknown error';
        console.error('Error details:', errorMessage);
        setError(`Error loading audio file: ${errorMessage}`);
      });
      
      // Thêm sự kiện khi audio kết thúc
      audioElementRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
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
      
      console.log('Audio initialized successfully');
      setError(null);
    } catch (error) {
      console.error('Error initializing audio:', error);
      setError('Error initializing audio: ' + error.message);
    }
  };

  // Khởi tạo audio khi component mount hoặc audioUrl thay đổi
  useEffect(() => {
    // Đảm bảo audioUrl có giá trị trước khi khởi tạo
    if (audioUrl) {
      initAudio();
    } else {
      setError('No audio URL provided');
    }
    
    // Cleanup function
    return () => {
      cleanupResources();
    };
  }, [audioUrl]);

  // Reset trạng thái khi audioUrl thay đổi
  useEffect(() => {
    setHasPlayed(false);
    setIsPlaying(false);
    setError(null);
  }, [audioUrl]);

  // Hàm phát âm thanh
  const playAudio = () => {
    if (!hasPlayed && audioElementRef.current && audioContextRef.current) {
      try {
        // Kiểm tra lại src của audio element
        if (!audioElementRef.current.src || audioElementRef.current.src === '') {
          // Nếu src trống, thiết lập lại
          let fullAudioUrl = audioUrl;
          if (!fullAudioUrl.startsWith('/audio/')) {
            fullAudioUrl = `/audio/${fullAudioUrl}`;
          }
          if (!fullAudioUrl.startsWith('/')) {
            fullAudioUrl = `/${fullAudioUrl}`;
          }
          audioElementRef.current.src = fullAudioUrl;
          console.log('Reset audio src to:', fullAudioUrl);
        }
        
        // Kiểm tra lại một lần nữa để đảm bảo src đã được thiết lập
        if (!audioElementRef.current.src || audioElementRef.current.src === '') {
          console.error('Audio src is still empty after reset');
          setError('Error: Audio source is empty');
          return;
        }
        
        // Đảm bảo audio context đang hoạt động
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        
        // Phát âm thanh
        audioElementRef.current.play();
        setIsPlaying(true);
        setHasPlayed(true);
        
        console.log('Playing audio with filter:', filterApplied.name);
      } catch (error) {
        console.error('Error playing audio:', error);
        setError('Error playing audio: ' + error.message);
      }
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
        <div className="filter-info">
          Filter applied: {filterApplied.name}
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;

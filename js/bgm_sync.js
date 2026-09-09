document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById('bgm-player');
    if (!audio) return;

    // Restore state
    const savedTime = sessionStorage.getItem('bgm_time');
    const isPlaying = sessionStorage.getItem('bgm_playing');

    if (savedTime !== null) {
        audio.currentTime = parseFloat(savedTime);
    }

    if (isPlaying === 'true') {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.log('Autoplay blocked:', e));
        }
    } else if (isPlaying === 'false') {
        audio.pause();
    }

    // Save state continuously
    setInterval(() => {
        if (audio) {
            sessionStorage.setItem('bgm_time', audio.currentTime);
            sessionStorage.setItem('bgm_playing', !audio.paused);
        }
    }, 500);

    // Save exactly on unload
    window.addEventListener("beforeunload", () => {
        if (audio) {
            sessionStorage.setItem('bgm_time', audio.currentTime);
            sessionStorage.setItem('bgm_playing', !audio.paused);
        }
    });

    // Handle user interaction for un-muting/playing
    audio.addEventListener('play', () => {
        sessionStorage.setItem('bgm_playing', 'true');
    });
    audio.addEventListener('pause', () => {
        sessionStorage.setItem('bgm_playing', 'false');
    });
});

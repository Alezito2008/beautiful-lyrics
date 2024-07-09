const lyricsContainer = document.querySelector('.lyrics-container');
const audioPlayer = document.querySelector('audio');
const exportButton = document.querySelector('button');

let musicPlaying = false;

function seconds2minutes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function minutes2seconds(minutes) {
    const [m, s] = minutes.split(':');
    return parseInt(m) * 60 + parseInt(s);
}

function select(elem) {
    document.querySelector('.current').classList.remove('current');
    elem.classList.add('current');
    elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

fetch('/song/lyrics.txt')
.then(response => response.text())
.then(lyrics => {
    lyrics = lyrics.split('\n');
    lyrics.forEach((lyric, index) => {
        const lyricElement = document.createElement('div');
        lyricElement.classList.add('lyric');
        const timeDiv = document.createElement('div');
        timeDiv.textContent = '0:00';
        timeDiv.classList.add('time');
        const p = document.createElement('div');
        p.textContent = lyric;
        lyricsContainer.appendChild(lyricElement);
        lyricElement.appendChild(timeDiv);
        lyricElement.appendChild(p);
        lyricElement.addEventListener('click', () => select(lyricElement.previousSibling));
        // if (index !== 0) return;
        // lyricElement.classList.add('current');
    })
})

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'Enter': {
            const currentLyric = document.querySelector('.current');
            const nextLyric = currentLyric.nextElementSibling;
            if (!nextLyric) return;
            currentLyric.classList.remove('current');
            nextLyric.classList.add('current');
            nextLyric.scrollIntoView({ behavior: 'smooth', block: 'center' });
            nextLyric.querySelector('.time').textContent = seconds2minutes(audioPlayer.currentTime);
            break
        }
        case ' ': {
            e.preventDefault();
            musicPlaying = !musicPlaying;
            musicPlaying ? audioPlayer.play() : audioPlayer.pause();
            break
        }
    }
})

function exportLyrics() {
    let allLyrics = [];

    const lyrics = document.querySelectorAll('.lyric');
    lyrics.forEach((lyric, index) => {
        if (index === 0) return;
        const time = lyric.querySelector('.time').textContent;
        const text = lyric.querySelector('div:nth-child(2)').textContent;
        allLyrics.push({seconds: minutes2seconds(time), lyrics: text});
    });
    // download
    const a = document.createElement('a');
    const file = new Blob([JSON.stringify(allLyrics)], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'lyrics.json';
    a.click();
    a.remove();
}

exportButton.addEventListener('click', exportLyrics);
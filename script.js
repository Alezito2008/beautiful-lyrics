var audioPaused = true;
const audioPlayer = document.getElementById('audioPlayer');

let newJson = [];

fetch('letra/lyrics.json')
.then(response => response.json())
.then(data => {
    let ignoreNext = false;
    for (let i = 0; i < data.length; i++) {
        if (ignoreNext) {
            ignoreNext = false;
            continue;
        }
        if (data[i + 1]) {
            if (data[i].seconds === data[i + 1].seconds) {
                newJson.push({seconds: data[i].seconds, lyrics: data[i].lyrics + '\n' + data[i + 1].lyrics});
                ignoreNext = true;
            } else {
                newJson.push(data[i]);
            }
        } else {
            newJson.push(data[i]);
        }
    }

    const lyricsContainer = document.querySelector('.lyrics-container');
    newJson.forEach(item => {
        console.log(item)
        const p = document.createElement('p');
        p.textContent = item.lyrics;
        p.setAttribute('data-time', item.seconds);
        lyricsContainer.appendChild(p);
    });

    // Añadir event listeners a los párrafos para hacer clic y saltar al tiempo correspondiente
    document.querySelectorAll('.lyrics-container p').forEach(p => {
        p.addEventListener('click', () => {
            audioPlayer.currentTime = parseFloat(p.getAttribute('data-time'));
            audioPaused = false;
            audioPlayer.play();
        });
    });

    audioPlayer.addEventListener('timeupdate', () => syncLyrics(newJson));

    audioPlayer.play();
})

function syncLyrics(data) {
    const currentTime = audioPlayer.currentTime;

    // Encontrar párrafo activo
    let currentIndex = 0;
    for (let i = 0; i < data.length; i++) {
        if (currentTime >= data[i].seconds) {
            currentIndex = i;
        } else {
            break;
        }
    }

    // Resaltar el párrafo actual y desactivar el anterior
    document.querySelectorAll('.lyrics-container p').forEach((p, index) => {
        if (index === currentIndex) {
            p.classList.add('sounding');
            p.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Ajustar velocidad animación
            const next = data[currentIndex + 1];
            if (next) {
                const animationDuration = (next.seconds - data[currentIndex].seconds - 0.1) + 's';
                p.style.animationDuration = animationDuration;
            }
        } else {
            p.classList.remove('sounding');
            p.style.animationDuration = '';
        }
    });
}

document.addEventListener('keydown', e => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    audioPaused ? audioPlayer.play() : audioPlayer.pause();
    audioPaused = !audioPaused;
});

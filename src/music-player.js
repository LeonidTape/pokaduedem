const tracks = [
  {
    title: "Rack - Towa, ELVEN DIOR",
    src: "pokaduedem/music/track2.mp3",
    cover: "pokaduedem/img/1.jpg"
  },
  {
    title: "SLAUGHTER - SAURXN, HUNTERPLAYA",
    src: "pokaduedem/music/track1.mp3",
    cover: "pokaduedem/img/2.png"
  },
  {
    title: "Scopin - Kordhell",
    src: "pokaduedem/music/track3.mp3",
    cover: "pokaduedem/img/3.jpg"
  },
  {
    title: "METAMORPHOSIS - INTERWORLD",
    src: "pokaduedem/music/track4.mp3",
    cover: "pokaduedem/img/4.jpg"
  }
];

let current = 0;
const audio = document.getElementById('audio');
const title = document.getElementById('track-title');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const volume = document.getElementById('volume');
const cover = document.getElementById('track-cover');

function setTrack(idx) {
  current = idx;
  audio.src = tracks[idx].src;
  title.textContent = tracks[idx].title;
  cover.src = tracks[idx].cover;
  if (!audio.paused) audio.play();
}

nextBtn.onclick = () => {
  setTrack((current + 1) % tracks.length);
  audio.play();
  playBtn.style.display = 'none';
  pauseBtn.style.display = '';
};
prevBtn.onclick = () => {
  setTrack((current - 1 + tracks.length) % tracks.length);
  audio.play();
  playBtn.style.display = 'none';
  pauseBtn.style.display = '';
};
playBtn.onclick = () => {
  audio.play();
  playBtn.style.display = 'none';
  pauseBtn.style.display = '';
};
pauseBtn.onclick = () => {
  audio.pause();
  pauseBtn.style.display = 'none';
  playBtn.style.display = '';
};
audio.onplay = () => {
  playBtn.style.display = 'none';
  pauseBtn.style.display = '';
};
audio.onpause = () => {
  pauseBtn.style.display = 'none';
  playBtn.style.display = '';
};
volume.oninput = () => {
  audio.volume = volume.value;
};
audio.volume = volume.value;
audio.onended = () => {
  setTrack((current + 1) % tracks.length);
  audio.play();
};
setTrack(0);

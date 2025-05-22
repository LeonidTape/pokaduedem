const continueBtn = document.getElementById('continue-btn');

const firebaseConfig = {
  apiKey: "AIzaSyAHhLIf20pXstk4j65iQJN-9sU-SE30o0M",
  authDomain: "kad-racing.firebaseapp.com",
  databaseURL: "https://kad-racing-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "kad-racing",
  storageBucket: "kad-racing.appspot.com",
  messagingSenderId: "644274833299",
  appId: "1:644274833299:web:b0298a763f7cbf83044a66",
  databaseURL: "https://kad-racing-default-rtdb.firebaseio.com/",
  measurementId: "G-99GXG804T1"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
function getUserKey() {
  let k = localStorage.getItem('nvb_uid');
  if (!k) {
    k = 'u' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('nvb_uid', k);
  }
  return k;
}
const USER_KEY = getUserKey();
const KEY_NICK = 'nvb_nickname';
let playerNick = localStorage.getItem(KEY_NICK) || '';
const lbBody = document.getElementById('lb-body');
const pauseNickInput = document.getElementById('pause-nick');
const personalRecordEl = document.getElementById('personal-record');
let leaderboard = {};
function updateLB() {
  lbBody.innerHTML = '';
  const arr = Object.values(leaderboard).sort((a, b) => b.score - a.score).slice(0, 5);
  arr.forEach((entry, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${entry.name}</td><td>${entry.score}</td>`;
    lbBody.appendChild(tr);
  });
}
function updatePauseRecord() {
  const nick = pauseNickInput.value.trim() || "";
  const entry = leaderboard[USER_KEY];
  personalRecordEl.textContent = "Личный рекорд: " + (entry ? entry.score : 0);
}
db.ref('leaderboard').on('value', snapshot => {
  leaderboard = snapshot.val() || {};
  updateLB();
  updatePauseRecord();
});
function addToLB(name, score) {
  const entry = leaderboard[USER_KEY];
  if (!entry || entry.score < score) {
    db.ref('leaderboard/' + USER_KEY).set({ name: name, score: score });
  }
}
function updateContinueBtnState() {
  continueBtn.disabled = !pauseNickInput.value.trim();
}
pauseNickInput.addEventListener('input', ()=>{
  if(pauseNickInput.value.length > 20) pauseNickInput.value = pauseNickInput.value.substr(0,20);
  updatePauseRecord();
  updateContinueBtnState();
});
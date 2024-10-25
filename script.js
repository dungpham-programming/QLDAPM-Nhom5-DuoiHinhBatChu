"use strict";

// Setup trò chơi.
const btnPlaying = document.querySelector(".btn-play");
const startZone = document.querySelector(".start");
const playingZone = document.querySelector(".playing");
const settingZone = document.querySelector("#settingsScreen");

//Xử lý nút "Chơi ngay"

btnPlaying.addEventListener("click", function () {
  const numTeam = document.getElementById("numTeam").value; // Số lượng đội chơi.
  createTeams(numTeam);

  //   if (!playing) {
  // playing = true;
  startZone.style.display = "none";
  settingZone.style.display = "flex";
  displayTeams(numTeam);

  // displayQuestion(questions[0]);
  // countdown();
  //   }
});

function createTeams(numTeam) {
  const teams = [];

  // Mảng lưu thông tin ban đầu
  for (let i = 1; i <= numTeam; i++) {
    teams.push({ name: `Team ${i}`, score: 0, time: 0 });
  }

  // Lưu mảng vào sessionStorage
  sessionStorage.setItem("teams", JSON.stringify(teams));
}

// Tuỳ chỉnh tên của đội chơi tại settingScreens.
function updatePlayerNames() {
  const teams = JSON.parse(sessionStorage.getItem("teams"));

  const inputName = document.querySelectorAll(".inputName");
  inputName.forEach((input, index) => {
    if (input.value.trim() !== "") {
      teams[index].name = input.value;
    }
  });
  sessionStorage.setItem("teams", JSON.stringify(teams));
}

// Hiển thị số lượng đội chơi
function displayTeams(numTeam) {
  const teamInputsContainer = document.getElementById("teamInfo");
  teamInputsContainer.innerHTML = ""; //Xoá màn hình đã có trước đó.
  for (let i = 1; i <= numTeam; i++) {
    const teamDiv = document.createElement("div");
    teamDiv.className = "teamInputDiv";
    teamDiv.innerHTML = `
               <img src="./images/avatar${i}.jpg" alt="Team ${i} class="teamAvatar" />
             <input type="text" class="inputName" value="Team ${i}"/>
            
            `;
    teamInputsContainer.appendChild(teamDiv);
  }
}
// Xử lý màn hình trò chơi.
function goToSettings() {
  // Lấy số đội tham gia
  const numTeam = document.getElementById("numTeam").value; // Số lượng đội chơi.
  createTeams(numTeam);
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("settingsScreen").style.display = "flex";

  displayTeams(numTeam);
}

// Quay lại từ đầu.
function goBackToStart() {
  sessionStorage.clear();
  settingZone.style.display = "none";
  startZone.style.display = "block";
  //   Xoá session storage.
}

let currentTeamIndex = 0;
let teams = JSON.parse(sessionStorage.getItem("teams"));

// HIển thị thông tin đội chơi.
function displayCurrentTeam() {
  const teamName = document.getElementById("teamName"); //Tạo thẻ div cho tên đội
  teamName.textContent = teams[currentTeamIndex].name;
  scoreEl.textContent = score;
}
// Lưu điểm số sau khi kết màn
function saveScoreAndTime(score, time) {
  teams[currentTeamIndex].score = score;
  teams[currentTeamIndex].time = time;

  sessionStorage.setItem("teams", JSON.stringify(teams));
}

// Xử lý nút "Sẵn sàng."
document.getElementById("fight").addEventListener("click", () => {
  updatePlayerNames();
  startGame();
});
function startGame() {
  // Lấy lại thông tin từ Session Storage mới nhất.
  teams = JSON.parse(sessionStorage.getItem("teams"));
  displayCurrentTeam();
  settingZone.style.display = "none";
  playingZone.style.display = "block";

  displayQuestion(questions[0]);
  countdown();
  timeTeam = 0;
  startTimer();
}

// Select element
const scoreEl = document.querySelector(".score");
const timeEl = document.querySelector(".time");
const imageEl = document.querySelector("img.image_question");
const answerEl = document.querySelector("#answer");
const selectWordEl = document.querySelector(".select_word");
const btnSuggest = document.querySelector(".btn_suggest");
const btnNext = document.querySelector(".btn_next");
const resultEl = document.querySelector("#result");
const statusResultEl = document.querySelector(".status_result");
const answerResultEl = document.querySelector(".answer_result");
const suggestEL = document.querySelector(".suggest");
const btnTestModal = document.querySelector(".test-modal");
const btnAgree = document.querySelector(".btn-agree");
const reportScorer = document.querySelector("#reportScorer");
const reportTimer = document.querySelector("#reportTimer");
const reportNextTeam = document.querySelector("#reportNextTeam");
const modal = bootstrap.Modal.getOrCreateInstance("#notification");
const NUM_QUES = 1; //Tạo 10 câu

let reportIntro = document.getElementById("reportIntro");
let closeI = document.getElementById("close2");
let endQ = NUM_QUES;
let q = 1;
let score = 0;
let sg = 3;
let arrCharacterAnswer = [];
let len;
let arrAnswer;
let time = 30;
let intervalID;
let playing = false;

let timeTeam = 0;
let intervalTeam;
function startTimer() {
  intervalTeam = setInterval(() => {
    timeTeam++; // Tăng thời gian mỗi giây
  }, 1000);
}

// Hàm để dừng bộ đếm thời gian
function stopTimer() {
  clearInterval(intervalTeam); // Dừng bộ đếm
  return timeTeam; // Trả về giá trị của timer
}

// Tạo ngẫu nhiên chuỗi chữ cái bao gồm đáp án.
// Tạo ngẫu nhiên chuỗi ký tự
const getRandomLetter = function () {
  const alphabet = "ABCDEGHIKLMNOPQRSTUVXY";
  const randomIndex = Math.trunc(Math.random() * alphabet.length);
  return alphabet[randomIndex];
};
// Chuyển đổi đáp án => Mảng ký tự
const getArrayCharacter = function (answer) {
  const normalizedStr = answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const arrCharacter = normalizedStr.split("");
  return arrCharacter;
};

// Trộn ngẫu nhiên
function shuffleArray(array) {
  let arrShuffle = [];
  let len = array.length;
  for (let i = 0; i < len; i++) {
    const randomIndex = Math.floor(Math.random() * array.length);
    arrShuffle.push(array[randomIndex]);
    array.splice(randomIndex, 1);
  }
  return arrShuffle;
}

// Hiển thị ô chứa ký tự cho người chơi lựa chọn <8.2.2>
const displayCellsSelect = function (arrCharacter) {
  let arrCellsSelect = [];
  arrCellsSelect = arrCharacter.filter((c) => c !== " ");
  let len = arrCellsSelect.length;
  for (let i = 0; i < len; i++) {
    arrCellsSelect.push(getRandomLetter());
  }
  // console.log(arrCellsSelect);
  const arrCellsShuff = shuffleArray(arrCellsSelect);
  for (let i = 0; i < arrCellsShuff.length; i++) {
    let html = `<li class="word" data-cell='${i}'>${arrCellsShuff[i]}</li>`;
    selectWordEl.innerHTML += html;
  }
};

// Hiển thị ô trống dành cho câu trả lời.
const displayCellsAnswer = function (arrCharacter) {
  let html = "";
  for (let i = 0; i < arrCharacter.length; i++) {
    html = `<div class="${
      arrCharacter[i] === " " ? "space" : "cell_answer"
    }" data-cell="" data-stt='${i}'></div>`;
    answerEl.innerHTML += html;
  }
};

// HIển thị kết hợp ô trống cho câu trả lời & ô chứa ký tự cho người chơi lựa chọn
const displayListCells = function (answer) {
  const arrCharacter = getArrayCharacter(answer);
  displayCellsAnswer(arrCharacter);
  displayCellsSelect(arrCharacter);
};

// Hiển thị câu đố hoàn chỉnh. <8.2>
const displayQuestion = function (question) {
  imageEl.src = question.url_image; //Hiển thị hình ảnh câu đố. <8.2.1>
  displayListCells(question.answer);
};

// Convert original
const convertAnswerInSystem = function (systemAnswer) {
  const arrCharacter = getArrayCharacter(systemAnswer);
  let strCharacter = "";

  for (let i = 0; i < arrCharacter.length; i++) {
    // Clear space in system answer
    if (arrCharacter[i] !== " ") {
      strCharacter += arrCharacter[i];
    }
  }
  return strCharacter;
};

const updateScore = function (nowScore) {
  score += nowScore;
  scoreEl.textContent = score;
};

// Function check answer from client
const checkAnswer = function (cellAnswer) {
  selectWordEl.style.display = "none";
  resultEl.style.display = "block";
  // Get answer of player
  console.log("finish");
  let answer = "";
  // const cellAnswer = document.querySelectorAll(".cell_answer");
  cellAnswer.forEach((cell) => {
    answer += cell.innerText;
  });

  // Convert original answer in system => Answer not contains space character
  const strCharacter = convertAnswerInSystem(questions[q - 1].answer);

  if (answer === strCharacter) {
    console.log("Correct !");
    // Initial score is 10. Handle score when time over 15s in countdown()
    updateScore(10);
    statusResultEl.classList.add("correct");
    statusResultEl.textContent = "Chính Xác!";
  } else {
    console.log("Wrong!");
    console.log(answer);
    statusResultEl.classList.remove("correct");
    statusResultEl.classList.add("incorrect");
    statusResultEl.textContent = "Không Chính Xác!";
  }
  // Display answer
  answerResultEl.textContent = `Đáp án là: ${questions[q - 1].answer}`;
  clearInterval(intervalID);
};

// Ham dem nguoc thoi gian
const countdown = function () {
  const getTime = function () {
    if (time < 0 && q < questions.length) {
      nextQuestion();
      timeEl.textContent = "30 s";
      sg = 3;
    } else if (time == 0 && q === questions.length) {
      timeEl.textContent = "0 s";
    } else {
      timeEl.textContent = time + " s";
      time--;
    }
    if (time < 6) {
      timeEl.style.color = "red";
    }
    if (time > 5) {
      timeEl.style.color = "black";
    }
  };
  intervalID = setInterval(getTime, 1000);
};

// Function next question
const nextQuestion = function () {
  clearInterval(intervalID);
  if (q < endQ) {
    imageEl.src = "";
    answerEl.innerHTML = "";
    selectWordEl.innerHTML = "";

    displayQuestion(questions[q]);
    q++;
    sg = 3;
    suggestEL.textContent = sg;
    selectWordEl.style.display = "flex";
    resultEl.style.display = "none";
    arrAnswer = getArrayCharacter(questions[q - 1].answer);
    time = 30;
  } else {
    const elapsedTime = stopTimer();
    saveScoreAndTime(score, elapsedTime); //Lưu điểm cho team1.
    reportEnding();
    overlay.style.display = "block";
    reportIntro.style.display = "block";
  }
};
// Xử lý khi teams chơi xong.
closeI.onclick = function () {
  reportIntro.style.display = "none";
  overlay.style.display = "none";
};

function resetScoreAndQ() {
  score = 0;
  endQ = endQ + NUM_QUES;
  timeTeam = 0;
}

function reportEnding() {
  const teams = JSON.parse(sessionStorage.getItem("teams"));
  reportScorer.textContent = `${teams[currentTeamIndex].score} điểm`;
  reportTimer.textContent = `${teams[currentTeamIndex].time} giây`;
  reportNextTeam.textContent = teams[currentTeamIndex + 1].name;
}

document.getElementById("continue").addEventListener("click", () => {
  resetScoreAndQ();
  teams = JSON.parse(sessionStorage.getItem("teams"));
  if (currentTeamIndex < teams.length) {
    currentTeamIndex++;
    reportIntro.style.display = "none";
    overlay.style.display = "none";
    displayCurrentTeam();
    // displayQuestion(questions[0]);
    nextQuestion();
    countdown();
    startTimer();
  } else {
    alert("Kết thúc rồi");
  }
});

const openModal = function () {
  modal.show();
};

const closeModal = function () {
  modal.hide();
};

// Khi bấm vào nút Tiếp theo
btnNext.addEventListener("click", function () {
  nextQuestion();
  countdown();
});

// Select a letter from list letter
selectWordEl.addEventListener("click", function (e) {
  console.log(e.target.localName === "li");
  if (e.target.localName === "li") {
    const cellAnswer = document.querySelectorAll(".cell_answer");
    const arrCell = [];
    cellAnswer.forEach((cell) => {
      if (cell.innerText === "") {
        arrCell.push(cell);
      }
    });
    arrCell[0].innerText = e.target.innerText;
    arrCell[0].dataset.cell = e.target.dataset.cell;
    e.target.innerText = "";

    // Call checkAnswer() when length = 1 (Only 1 char present in arrCell)
    if (arrCell.length === 1) {
      checkAnswer(cellAnswer);
    }
  }
});

// Undo select from answer cell
answerEl.addEventListener("click", function (e) {
  if (e.target.localName === "div") {
    const cellSelect = document.querySelectorAll(".word");
    cellSelect.forEach((cell) => {
      if (cell.dataset.cell === e.target.dataset.cell) {
        cell.innerText = e.target.innerText;
      }
    });
    e.target.innerText = "";
  }
});

arrAnswer = getArrayCharacter(questions[q - 1].answer);
// Xử lý phần gợi ý câu hỏi. 8.5
btnSuggest.addEventListener("click", function () {
  const cellAnswer = document.querySelectorAll(".cell_answer");
  const arrCell = [];
  if (sg === 0) {
    alert("Bạn đã hết lượt xem gợi ý");
    suggestEL.textContent = 0;
  } else if (sg > 0 && sg < 4) {
    const arrLetter = [];
    if (sg < 1) {
      suggestEL.textContent = 0;
    }

    // Remove element space
    cellAnswer.forEach((cell) => {
      if (cell.innerText !== "") {
        arrLetter.push(cell.innerText);
      }
    });
    if (sg === 3 && arrLetter.length === 0) {
      arrCharacterAnswer = arrAnswer.filter((el) => el !== " ");
    } else if (sg === 3 && arrLetter.length > 0) {
      // Remove letter exits
      const arrCharacter = arrAnswer.filter((el) => el !== " ");
      arrCharacterAnswer = arrCharacter.slice(arrLetter.length);
      console.log(arrCharacterAnswer);
    }

    len = arrCharacterAnswer.length;
    // Get random letter of array answer
    let index = Math.trunc(Math.random() * len);
    let letter = arrCharacterAnswer[index];
    console.log(letter);
    // Remove letter suggested
    arrCharacterAnswer.splice(index, 1);
    console.log(arrCharacterAnswer);
    // Get index of arrAnswer
    let stt;
    for (let i = 0; i < arrAnswer.length; i++) {
      if (arrAnswer[i] === letter) {
        stt = i;
      }
    }
    arrAnswer[stt] = "*";
    console.log(stt);
    // Display cell suggest random
    cellAnswer.forEach((cell) => {
      if (cell.dataset.stt == stt) {
        cell.innerText = letter;
      }
    });
    sg--;
    if (sg >= 0) {
      suggestEL.textContent = sg;
    }
    cellAnswer.forEach((cell) => {
      if (cell.innerText === "") {
        arrCell.push(cell);
      }
    });
    if (arrCell.length === 0) {
      checkAnswer(cellAnswer);
    }
  }
});

// Test hiển thị Modal và gán dữ liệu của chức năng đã yêu cầu Modal vào nút Đồng ý (Ở đây là chức năng test-modal)
btnTestModal.addEventListener("click", function () {
  document
    .querySelector(".btn-agree")
    .setAttribute("data-request", "test-modal");
  openModal();
});

// Hàm handle khi click nút Đồng ý (Đây là hàm chung, chia switch case để handle các trường hợp khi ấn nút đồng ý)
btnAgree.addEventListener("click", function () {
  const requestValue = document
    .querySelector(".btn-agree")
    .getAttribute("data-request");

  switch (requestValue) {
    case "test-modal":
      // Xử lý sự kiện ở đây. Mẫu ở đây là hiện lên Alert
      alert(`Bạn dã bấm vào nút Đông ý từ chức năng ${requestValue}`);
      closeModal();
      break;

    // Các chức năng khác cứ thế tiếp tục handle
    default:
      break;
  }
  closeModal();
});

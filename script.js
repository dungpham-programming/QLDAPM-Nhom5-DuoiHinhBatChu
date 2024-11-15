"use strict";

// Select element auth
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
const questionsPerTeam = 10;
const reportScorer = document.querySelector("#reportScorer");
const reportTimer = document.querySelector("#reportTimer");
const reportNextTeam = document.querySelector("#reportNextTeam");
const modal = bootstrap.Modal.getOrCreateInstance("#notification");
const nowQuestionNumEl = document.getElementById("nowQuestionNum");
const NUM_QUES = 10; //Tạo 10 câu
const teamDoneSound = new Audio("./sounds/team_done.mp3");
const totalRankingSound = new Audio("./sounds/total_ranking.mp3");
const buttonPushSound = new Audio("./sounds/button_push.mp3");
const suggestOkSound = new Audio("./sounds/suggest_ok.mp3");
const suggestFailSound = new Audio("./sounds/suggest_fail.mp3");
const correctSound = new Audio("./sounds/correct.mp3");
const btnRestartTeam = document.querySelector(".btn_restart_group");
const warningModal = bootstrap.Modal.getOrCreateInstance("#warningModal");
const btnConfirmNext = document.querySelector("#confirmNext");
const warningModalRestartGroup = bootstrap.Modal.getOrCreateInstance(
    "#warningModalRestartGroup"
);
const btnConfirmRestartGroup = document.querySelector("#confirmRestart");
const errorSound = new Audio("./sounds/error.mp3");
const countDownSound = new Audio("./sounds/count_down.mp4");
teamDoneSound.volume = 0.5;
totalRankingSound.volume = 0.3;
buttonPushSound.volume = 0.5;
suggestOkSound.volume = 0.5;
suggestFailSound.volume = 0.5;
correctSound.volume = 0.5;
errorSound.volume = 0.5;

let reportIntro = document.getElementById("reportIntro");
let closeI = document.getElementById("close2");
let endQ = NUM_QUES;

let q;

let score = 0;
let sg = 3;
let arrCharacterAnswer = [];
let len;
let arrAnswer;
let time = 30;
let intervalID;
let playing = false;
// Tạm thời để mặc định là 4 để phân chia các pack câu hỏi
let totalTeam = 4;
let nowTeamIndex = 0;
let nowTeamName;
let allPacks = [];
let nowPack;

let timeTeam = 0;
let intervalTeam;
let answered = false;

let isSgDisabled = false; // Kiểm soát nút gợi ý.

// Setup trò chơi.
const btnPlaying = document.querySelector(".btn-play");
const startZone = document.querySelector(".start");
const playingZone = document.querySelector(".playing");
const settingZone = document.querySelector("#settingsScreen");

//Xử lý nút "Chơi ngay"

btnPlaying.addEventListener("click", function () {
    const numTeam = document.getElementById("numTeam").value; // Số lượng đội chơi.
    createTeams(numTeam);
    buttonPushSound.play();
    //   if (!playing) {
    // playing = true;
    startZone.style.display = "none";
    playingZone.style.display = "none";
    settingZone.style.display = "flex";
    displayTeams(numTeam);

    // displayQuestion(questions[0]);
    // countdown();
    //   }
});

// Tạo mảng teams từ số lương team người dùng chọn, sau đó lưu vào Session Storage
function createTeams(numTeam) {
    const teams = [];

    // Mảng lưu thông tin ban đầu
    for (let i = 1; i <= numTeam; i++) {
        teams.push({name: `Team ${i}`, score: 0, time: 0});
    }

    // Lưu mảng vào sessionStorage
    sessionStorage.setItem("teams", JSON.stringify(teams));
}

// Tuỳ chỉnh tên của đội chơi tại settingScreens.
function updatePlayerNames() {
    const teams = JSON.parse(sessionStorage.getItem("teams"));

    const inputName = document.querySelectorAll(".inputName");

    const nameSet = new Set();
    let hasDupName = false;

    inputName.forEach((input, index) => {
        const name = input.value.trim();
        if (nameSet.has(name)) {
            hasDupName = true;
            input.classList.add("inputError");
        } else {
            nameSet.add(name);
            input.classList.remove("inputError");
        }

        if (!hasDupName && name !== "" && index < teams.length) {
            teams[index].name = name;
        }
    });
    // Kiểm tra và hiển thị thông báo lỗi nếu có tên trùng
    if (hasDupName) {
        const duplicatedModal = bootstrap.Modal.getOrCreateInstance(
            "#duplicated"
        );
        duplicatedModal.show();
        return false;
    }
    sessionStorage.setItem("teams", JSON.stringify(teams));
    return true;
}

// Hiển thị số lượng đội chơi
function displayTeams(numTeam) {
    const teamInputsContainer = document.getElementById("teamInfo");
    teamInputsContainer.innerHTML = ""; //Xoá màn hình đã có trước đó.
    for (let i = 1; i <= numTeam; i++) {
        const teamDiv = document.createElement("div");
        teamDiv.className = "teamInputDiv";
        teamDiv.innerHTML = `
               <img src="./images/avatar${i}.jpg" alt="Team ${i}" class="teamAvatar" />
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
    buttonPushSound.play();
    sessionStorage.clear();
    settingZone.style.display = "none";
    startZone.style.display = "block";
    //   Xoá session storage.
}

const setStartStateByTeamIndex = function (index) {
};

const updateRankingUi = function () {
    const teams = updateRanking();
    const records = document.querySelectorAll(".ranking .grid-record");
    records.forEach((record) => {
        record.innerHTML = ""; // Xóa toàn bộ HTML bên trong thẻ
    });
    updateRankingHtml(teams, ".ranking");
};

const updateRanking = function () {
    // Không cập nhật lại vào session, chỉ thay đổi trên biến của mảng
    const teams = JSON.parse(sessionStorage.getItem("teams"));
    teams.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        } else {
            return a.time - b.time;
        }
    });
    return teams;
};

const updateRankingHtml = function (teams, elementTag) {
    for (let i = 0; i < teams.length; i++) {
        const record = document.querySelector(
            `${elementTag} .grid-record[data-rank="${i + 1}"]`
        );
        if (record) {
            const colorHex = getColorMedal(i + 1);
            record.style.display = "grid";
            record.innerHTML = `
                <i class="fa-solid fa-medal ps-1" style="color: ${colorHex}; font-size: 24px"></i>
                <div class="rank">
                    ${i + 1}
                </div>
                <div class="name">
                    ${teams[i].name}
                </div>
                <div class="time">
                    ${teams[i].time}s
                </div>
                <div class="score">
                    ${teams[i].score}
                </div>
            `;
        }
    }
};

const getColorMedal = function (ranking) {
    switch (ranking) {
        case 1:
            return "#FFD43B";
        case 2:
            return "#817f7f";
        case 3:
            return "#e15a1c";
        default:
            return "black";
    }
};

const startGame = function () {
    // Lấy lại thông tin từ Session Storage mới nhất.
    answered = false;
    teams = JSON.parse(sessionStorage.getItem("teams"));
    sg = 3;
    suggestEL.textContent = sg;
    q = 1; // Đặt q trước khi displayCurrentTeam
    displayCurrentTeam();
    settingZone.style.display = "none";
    playingZone.style.display = "block";
    allPacks = createPacksQuestion();
    nowPack = allPacks[0];
    console.log(nowPack);
    displayQuestion(nowPack[0]);
    arrAnswer = getArrayCharacter(nowPack[0].answer); // Tạo ra gợi ý
    enableBtnSuggest();
    countdown();
    timeTeam = 0;
    startTimer();
    updateRankingUi();
};

let currentTeamIndex = 0;
let teams = JSON.parse(sessionStorage.getItem("teams"));

// HIển thị thông tin đội chơi.
function displayCurrentTeam() {
    const teamName = document.getElementById("teamName"); //Tạo thẻ div cho tên đội
    teamName.textContent = teams[currentTeamIndex].name;
    nowQuestionNumEl.textContent = `${q}`;
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
    buttonPushSound.play();
    if (updatePlayerNames()) {
        startGame();
    }
});

// Hàm tạo ra các bộ (pack) câu hỏi cho các team
const createPacksQuestion = function () {
    if (questions.length < totalTeam * questionsPerTeam) {
        throw new Error("Tối đa chỉ có thể có 4 đội.");
    }

    // Tạo mảng để chứa index của câu hổi
    const indexQuestionArray = Array.from(
        {length: questions.length},
        (_, i) => i
    );
    const shuffleIndexes = shuffleIndexQuestionArray(indexQuestionArray);

    // Tạo mảng để chứa các pack câu hỏi dựa trên số lượng team
    const packs = Array.from({length: totalTeam}, () => []);

    // Thêm câu hỏi vào các pack
    for (let i = 0; i < shuffleIndexes.length; i++) {
        const teamIndex = Math.floor(i / questionsPerTeam);
        // Do teamIndex bắt đầu từ 0 => teamIndex nhỏ hơn totalItem
        if (teamIndex < totalTeam) {
            packs[teamIndex].push(questions[shuffleIndexes[i]]);
        } else break;
    }

    return packs;
};

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
        let html = `<li class="word col-4 col-md-3 col-lg-2 " data-cell='${i}'>${arrCellsShuff[i]}</li>`;
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

// Hàm random index của câu hỏi, trả về 1 mảng gồm các index đã được xáo trộn của câu hỏi trong question.js
const shuffleIndexQuestionArray = function (array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Hiển thị câu đố hoàn chỉnh. <8.2>
const displayQuestion = function (question) {
    console.log(answered);
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

const updateScore = function () {
    if (time > 0 && time < 15) {
        score += 5;
    } else if (time >= 15) {
        score += 10;
    }
    scoreEl.textContent = score;
};

// Function check answer from client
//
const checkAnswer = function (cellAnswer) {
    // Đánh dấu là đã trả lời
    answered = true;
    selectWordEl.style.display = "none";
    resultEl.style.display = "block";
    // Get answer of player
    console.log("finish");
    let answer = "";
    // const cellAnswer = document.querySelectorAll(".cell_answer");
    cellAnswer.forEach((cell) => {
        answer += cell.innerText;
    });

    const nowQuestion = nowPack[q - 1];
    // Convert original answer in system => Answer not contains space character
    const strCharacter = convertAnswerInSystem(nowQuestion.answer);
    clearInterval(intervalID);

    if (answer === strCharacter) {
        // Initial score is 10. Handle score when time over 15s in countdown()
        updateScore();
        statusResultEl.classList.remove("incorrect");
        statusResultEl.classList.add("correct");
        statusResultEl.textContent = "Chính Xác!";
        countDownSound.pause();
        correctSound.play();
    } else {
        errorSound.play();
        countDownSound.pause();
        statusResultEl.classList.remove("correct");
        statusResultEl.classList.add("incorrect");
        statusResultEl.textContent = "Không Chính Xác!";
    }
    console.log(answered);
    // Display answer
    answerResultEl.textContent = `Đáp án là: ${nowQuestion.answer}`;

    // Update score & ranking
    saveScoreAndTime(score, timeTeam); // Lưu điểm và thời gian
    updateRankingUi();
};

// Biến cờ để kiểm soát việc tạm dừng countdown 8.14.15.
let isCountdownPaused = false;

const countdown = function () {
    let endTime = Date.now() + time * 1000; // Thời gian kết thúc của countdown (30s)

    const getTime = function () {
        if (isCountdownPaused) return;

        // Tính toán thời gian còn lại dựa trên thời gian thực
        const timeRemaining = Math.max(-1, Math.round((endTime - Date.now()) / 1000));
        time = timeRemaining;
        if (timeRemaining < 10) {
            timeEl.textContent = `0${timeRemaining} s`;
        } else {
            timeEl.textContent = timeRemaining + " s";
        }

        // Điều kiện xử lý khi hết thời gian cho câu hỏi hiện tại
        if (timeRemaining < 0) {
            if (q <= nowPack.length) {
                // enableBtnSuggest();
                nextQuestion();
                endTime = Date.now() + 30 * 1000; // Đặt lại đếm ngược 30s cho câu hỏi mới
            } else {
                clearInterval(intervalID);
                timeEl.textContent = "0 s";
                return;
            }
        }

        // Âm thanh và hiệu ứng màu sắc khi còn <= 10 giây
        if (timeRemaining <= 10 && timeRemaining >= 0) {
            timeEl.style.color = "red";

            if (countDownSound.paused) {
                countDownSound.play().catch((error) => {
                    console.error("Lỗi khi phát âm thanh: ", error);
                });
            }
        } else {
            timeEl.style.color = "black";
        }

        if (timeRemaining < 0 && !countDownSound.paused) {
            countDownSound.pause(); // Dừng âm thanh khi hết thời gian
            countDownSound.currentTime = 0; // Đặt lại vị trí âm thanh về đầu
        }
    };

    intervalID = setInterval(getTime, 1000);
}

// Function next question
const nextQuestion = function () {
    clearInterval(intervalID);
    countDownSound.pause();

    if (q < endQ) {
        answered = false; // Đánh dấu là chưa trả lời khi đến câu hỏi tiếp theo
        buttonPushSound.play(); // Phát âm thanh khi chuyển câu hỏi

        // Cập nhật các thông tin và phần tử cho câu hỏi tiếp theo
        q++;
        saveScoreAndTime(score, timeTeam); // Lưu điểm và thời gian
        updateRankingUi(); // Cập nhật bảng xếp hạng
        const nowQuestion = nowPack[q - 1];
        imageEl.src = "";
        answerEl.innerHTML = "";
        selectWordEl.innerHTML = "";
        displayQuestion(nowQuestion);
        selectWordEl.style.display = "flex";
        resultEl.style.display = "none";
        nowQuestionNumEl.textContent = `${q}`;
        arrAnswer = getArrayCharacter(nowQuestion.answer);
        time = 30; // Đặt lại thời gian cho câu hỏi tiếp theo
        timeEl.style.color = "black";
        timeEl.textContent = `${time} s`;
        countdown();
    } else {
        // Phát âm thanh hoàn thành trong 3 giây rồi dừng lại
        teamDoneSound.play();
        setTimeout(() => {
            teamDoneSound.pause();
            teamDoneSound.currentTime = 0;
        }, 3000); // Dừng âm thanh sau 3 giây

        const elapsedTime = stopTimer(); // Dừng bộ đếm và lấy thời gian
        saveScoreAndTime(score, elapsedTime); // Lưu điểm và thời gian
        updateRankingUi(); // Cập nhật bảng xếp hạng
        reportEnding(); // Kết thúc báo cáo

        // Hiển thị giao diện báo cáo kết thúc
        overlay.style.display = "block";
        reportIntro.style.display = "block";
    }
};

function resetScoreAndQ() {
    score = 0;
    q = 0; // Do khi gọi nextQuestion, q sẽ tăng thêm 1 ngay lần gọi => q = 0
    timeTeam = 0;
}

function reportEnding() {
    clearInterval(intervalID);
    countDownSound.pause();
    const teams = JSON.parse(sessionStorage.getItem("teams"));
    reportScorer.textContent = `${teams[currentTeamIndex].score} điểm`;
    reportTimer.textContent = `${teams[currentTeamIndex].time} giây`;
    currentTeamIndex < teams.length - 1
        ? (reportNextTeam.textContent = teams[currentTeamIndex + 1].name)
        : (reportNextTeam.textContent = "None");
}

document.getElementById("continue").addEventListener("click", () => {
    resetScoreAndQ();
    countDownSound.pause();
    overlay.style.display = "none";
    teams = JSON.parse(sessionStorage.getItem("teams"));
    if (currentTeamIndex < teams.length - 1) {
        buttonPushSound.play();
        currentTeamIndex++;
        reportIntro.style.display = "none";
        displayCurrentTeam();
        nowPack = allPacks[currentTeamIndex]; // Cập nhật pack câu hỏi cho đội kế tiếp
        console.log(nowPack);
        sg = 3;
        suggestEL.textContent = sg;
        enableBtnSuggest();
        nextQuestion();
        startTimer();
    } else {
        totalRankingSound.play();
        clearInterval(intervalID);
        showTotalRanking();
    }
});

// Hàm mở total ranking
const openTotalRanking = function () {
    const modal = bootstrap.Modal.getOrCreateInstance("#totalRanking");
    modal.show();
};

// Hàm đóng total ranking
const closeTotalRanking = function () {
    const modal = bootstrap.Modal.getOrCreateInstance("#totalRanking");
    modal.hide();
};
// Hàm mở modal
const openModal = function () {
    modal.show();
};

// Hàm đóng modal
const closeModal = function () {
    modal.hide();
};

const showTotalRanking = function () {
    updateRankingUi();
    reportIntro.style.display = "none";
    const teams = updateRanking();
    const totalRankingRecords = document.querySelectorAll(
        "#totalRanking .grid-record"
    );
    totalRankingRecords.forEach((record) => {
        record.innerHTML = ""; // Xóa toàn bộ HTML bên trong thẻ
    });
    updateRankingHtml(teams, "#totalRanking");
    openTotalRanking();
};

// Xóa nội dung của các trường chơi như câu hỏi, ô đáp án và ô lựa chọn ký tự cho đáp án
const clearPlayingField = function () {
    imageEl.src = "";
    answerEl.innerHTML = "";
    selectWordEl.innerHTML = "";
};

// Khi bấm vào nút Tiếp theo
btnNext.addEventListener("click", function () {
    if (!isQuestionCompleted()) {
        buttonPushSound.play();
        warningModal.show();
    } else {
        if (sg > 0) {
            enableBtnSuggest();
        }
        nextQuestion();
    }
});

// Xử lý khi người dùng xác nhận muốn bỏ qua
btnConfirmNext.addEventListener("click", function () {
    warningModal.hide();
    if (sg > 0) {
        enableBtnSuggest();
    }
    nextQuestion();
});

// Kiểm tra xem câu đố đã hoàn thành chưa
const isQuestionCompleted = () => {
    const cellAnswers = document.querySelectorAll(".cell_answer");
    for (let cell of cellAnswers) {
        if (cell.innerText === "") {
            return false;
        }
    }
    return true;
};

// Select a letter from list letter
selectWordEl.addEventListener("click", function (e) {
    // console.log(e.target.localName === "li");
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
            disableBtnSuggest();
            checkAnswer(cellAnswer);
        }
    }
});

// Undo select from answer cell
answerEl.addEventListener("click", function (e) {
    if (!answered && e.target.localName === "div") {
        const cellSelect = document.querySelectorAll(".word");
        cellSelect.forEach((cell) => {
            if (cell.dataset.cell === e.target.dataset.cell) {
                cell.innerText = e.target.innerText;
            }
        });
        e.target.innerText = "";
    }
});

// Hàm để trộn mảng ngẫu nhiên
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Lấy chỉ số ngẫu nhiên
        [array[i], array[j]] = [array[j], array[i]]; // Hoán đổi
    }
}

// Xử lý phần gợi ý câu hỏi. 8.5
btnSuggest.addEventListener("click", function () {
    const cellAnswer = document.querySelectorAll(".cell_answer");
    // Đếm số ô trống
    let emptyCells = 0;
    cellAnswer.forEach((cell) => {
        if (cell.innerText === "" && !cell.classList.contains("space")) {
            emptyCells++;
        }
    });
    // Kiểm tra nếu đã hoàn thành
    if (emptyCells === 0) {
        return; // Thoát khỏi hàm nếu đã hoàn thành
    } else {
        // Kiểm tra lượt gợi ý
        if (sg === 0) {
            suggestFailSound.play();
            suggestEL.textContent = 0;
            return;
        }
        if (sg > 0) {
            suggestOkSound.play();
            // Tạo mảng chứa các ô trống và chữ cái tương ứng
            const emptySlots = [];
            for (const cell of cellAnswer) {
                const index = cell.getAttribute("data-stt"); // Lấy giá trị của data-stt
                if (cell.classList.contains("space")) {
                    continue; // Nếu có lớp 'space', bỏ qua cell này
                }
                // Kiểm tra xem innerText có trống hay không (bao gồm cả khoảng trắng)
                if (cell.innerText.trim() === "") {
                    emptySlots.push({
                        cell: cell,
                        index: index,
                    });
                }
            }
            // Chỉ gợi ý tối đa 3 vị trí hoặc tất cả các vị trí còn lại nếu ít hơn 3
            const numHintsToShow = Math.min(3, emptySlots.length);
            // Xáo trộn các vị trí trống
            shuffle(emptySlots);

            // Điền chữ cái vào các ô trống
            for (let i = 0; i < numHintsToShow; i++) {
                const slot = emptySlots[i];
                slot.cell.innerText = arrAnswer[slot.index];
            }
            // Giảm số lần gợi ý
            sg--;
            suggestEL.textContent = sg;
            if (sg === 0) {
                disableBtnSuggest()
            }
            // Kiểm tra nếu đã điền hết các ô
            emptyCells = 0; // Đặt lại biến emptyCells
            cellAnswer.forEach((cell) => {
                if (cell.innerText === "" && !cell.classList.contains("space")) {
                    emptyCells++;
                }
            });
            // Kiểm tra lại nếu đã hoàn thành
            if (emptyCells === 0) {
                disableBtnSuggest();
                checkAnswer(cellAnswer);
            }
        } else if (sg === 0) {
            suggestFailSound.play();
            suggestEL.textContent = 0;
        }
    }
});

// Vô hiệu hoá và bật lại button.
function disableBtnSuggest() {
    isSgDisabled = false;
    btnSuggest.classList.add("disabled");
}

function enableBtnSuggest() {
    isSgDisabled = true;
    btnSuggest.classList.remove("disabled");
}

const clearAnswerStatus = function () {
    statusResultEl.classList.remove("incorrect");
    statusResultEl.classList.remove("correct");
    statusResultEl.textContent = "";
    imageEl.src = "";
    answerEl.innerHTML = "";
    selectWordEl.innerHTML = "";
};
// Reset all game state variables
const restartGame = function () {
    // Reset session storage
    sessionStorage.clear();

    // Reset game state variables
    answered = false;
    enableBtnSuggest();
    currentTeamIndex = 0;
    score = 0;
    q = 1;
    time = 30;
    sg = 3;
    timeTeam = 0;
    playing = false;
    allPacks = [];
    nowPack = null;
    arrCharacterAnswer = [];
    isCountdownPaused = false;

    // Clear intervals
    clearInterval(intervalID);
    clearInterval(intervalTeam);

    // Reset UI elements
    clearPlayingField();
    resultEl.style.display = "none";
    scoreEl.textContent = "0";
    timeEl.textContent = "30 s";
    timeEl.style.color = "black";
    suggestEL.textContent = "3";

    // Hide all game zones except start
    playingZone.style.display = "none";
    settingZone.style.display = "none";
    startZone.style.display = "block";

    // Reset ranking display
    const rankingRecords = document.querySelectorAll(".ranking .grid-record");
    rankingRecords.forEach((record) => {
        record.style.display = "none";
        record.innerHTML = "";
    });

    // Close any open modals
    const totalRankingModal =
        bootstrap.Modal.getOrCreateInstance("#totalRanking");
    totalRankingModal.hide();

    // Play sound effect
    buttonPushSound.play();
};

// restart game
// 8.14.12 - Gộp nút chơi lại ở (cuối game) với nút chơi lại toàn bộ trong game.
document.querySelectorAll(".btn-restart").forEach((button) => {
    button.addEventListener("click", () => {
        // PHân biệt giữa nút chơi lại toàn bộ game # chơi lại 8.14.12
        const skipModal = button.getAttribute("data-skip-modal");
        if (skipModal === "true") {
            restartGame();
        } else {
            // Show confirmation modal before restarting
            const notificationTitle = document.querySelector("#notificationTitle");
            const notificationBody = document.querySelector("#modal-body");
            const btnAgree = document.querySelector(".btn-agree");

            notificationTitle.textContent = "Xác nhận khởi động lại";
            notificationBody.textContent =
                "Bạn có chắc chắn muốn khởi động lại trò chơi? Toàn bộ tiến trình sẽ bị mất.";
            btnAgree.setAttribute("data-request", "restart-game");

            openModal();
        }
    });
});

const existingClickHandler = document.querySelector(".btn-agree").onclick;
document.querySelector(".btn-agree").onclick = function () {
    const requestValue = this.getAttribute("data-request");
    if (requestValue === "restart-game") {
        restartGame();
        closeModal();
    } else if (existingClickHandler) {
        existingClickHandler.call(this);
    }
};

function restartCurrentTeam() {
    q = 1;
    score = 0;
    sg = 3;
    time = 30;
    timeTeam = 0;
    answered = false;
    enableBtnSuggest();
    scoreEl.textContent = score;
    suggestEL.textContent = sg;
    nowQuestionNumEl.textContent = q;

    clearInterval(intervalID);
    clearInterval(intervalTeam);

    clearPlayingField();

    selectWordEl.style.display = "flex";
    resultEl.style.display = "none";

    nowPack = allPacks[currentTeamIndex];

    displayQuestion(nowPack[0]);
    arrAnswer = getArrayCharacter(nowPack[0].answer);

    countdown();
    startTimer();

    const teams = JSON.parse(sessionStorage.getItem("teams"));
    teams[currentTeamIndex].score = 0;
    teams[currentTeamIndex].time = 0;
    sessionStorage.setItem("teams", JSON.stringify(teams));

    updateRankingUi();
}

btnRestartTeam.addEventListener("click", function () {
    warningModalRestartGroup.show();
});

btnConfirmRestartGroup.addEventListener("click", function () {
    buttonPushSound.play();
    countDownSound.pause();
    restartCurrentTeam();
    warningModalRestartGroup.hide();
});

// Hàm để chuyển đổi text thành icon khi màn hình có kích thước Medium
function updateButtonIcons() {
    const buttonRestartAll = document.querySelector('.btn-restart');
    const buttonRestartGroup = document.querySelector('.btn_restart_group');
    const buttonSuggest = document.querySelector('.btn_suggest');
    const buttonNext = document.querySelector('.btn_next');
    const buttons = [
        {
            buttonElement: buttonRestartAll,
            responsiveText: `<i class="icon-playing fa-solid fa-rotate-right"></i>  (Toàn bộ)`,
            fullText: 'Chơi lại (Toàn bộ game)'
        },
        {
            buttonElement: buttonRestartGroup,
            responsiveText: `<i class="icon-playing fa-solid fa-rotate-right"></i>  (Hiện tại)`,
            fullText: 'Chơi lại (Nhóm hiện tại)'
        },
        {
            buttonElement: buttonSuggest,
            responsiveText: `<i class="icon-playing fa-solid fa-lightbulb"></i>   (Gợi ý)`,
            fullText: 'Gợi ý'
        },
        {
            buttonElement: buttonNext,
            responsiveText: `<i class="icon-playing fa-solid fa-forward"></i> (Tiếp theo)`,
            fullText: 'Tiếp theo'
        }
    ];
    const screenWidth = window.innerWidth;

    // Kiểm tra kích thước màn hình Medium (768px - 991px)
    if (screenWidth <= 768) {
        buttons.forEach(button => {
            button.buttonElement.innerHTML = button.responsiveText;
        });
    } else {
        buttons.forEach(button => {
            button.buttonElement.innerHTML = button.fullText;
        });
    }
}

// Gọi hàm khi tải trang và khi thay đổi kích thước màn hình
window.addEventListener('load', updateButtonIcons);
window.addEventListener('resize', updateButtonIcons);
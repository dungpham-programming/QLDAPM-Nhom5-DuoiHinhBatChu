"use strict";
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
const btnPlaying = document.querySelector(".btn-play")
const modal = bootstrap.Modal.getOrCreateInstance('#notification');
const startZone = document.querySelector(".start");
const playingZone = document.querySelector(".playing");
const questionsPerTeam = 10;

let q = 1;
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
let nowTeam = 1;
let allPacks = [];
let nowPack;

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

// Hàm random index của câu hỏi, trả về 1 mảng gồm các index đã được xáo trộn của câu hỏi trong question.js
const shuffleIndexQuestionArray = function (array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Hàm tạo ra các bộ (pack) câu hỏi cho các team
const createPacksQuestion = function () {
    if (questions.length < totalTeam * questionsPerTeam) {
        throw new Error("Tối đa chỉ có thể có 4 đội.");
    }

    // Tạo mảng để chứa index của câu hổi
    const indexQuestionArray = Array.from({ length: questions.length }, (_, i) => i);
    const shuffleIndexes = shuffleIndexQuestionArray(indexQuestionArray);

    // Tạo mảng để chứa các pack câu hỏi dựa trên số lượng team
    const packs = Array.from({ length: totalTeam }, () => []);

    // Thêm câu hỏi vào các pack
    for (let i = 0; i < shuffleIndexes.length; i++) {
        const teamIndex = Math.floor(i / questionsPerTeam);
        // Do teamIndex bắt đầu từ 0 => teamIndex nhỏ hơn totalItem
        if (teamIndex < totalTeam) {
            packs[teamIndex].push(questions[shuffleIndexes[i]]);
        } else break;
    }

    return packs;
}

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
}

const updateScore = function (nowScore) {
    score += nowScore;
    scoreEl.textContent = score;
}

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
    const strCharacter = convertAnswerInSystem(nowPack[q - 1].answer);

    if (answer === strCharacter) {
        console.log("Correct !");
        // Initial score is 10. Handle score when time over 15s in countdown()
        updateScore(10);
        statusResultEl.classList.remove("incorrect");
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
    answerResultEl.textContent = `Đáp án là: ${nowPack[q - 1].answer}`;
    clearInterval(intervalID);
};

// Ham dem nguoc thoi gian
const countdown = function () {
    const getTime = function () {
        if (time < 0 && q < nowPack.length) {
            nextQuestion();
            timeEl.textContent = "30 s";
            sg = 3;
        } else if (time == 0 && q === nowPack.length) {
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
    if (q < 10) {
        imageEl.src = "";
        answerEl.innerHTML = "";
        selectWordEl.innerHTML = "";

        displayQuestion(nowPack[q]);
        q++;
        sg = 3;
        suggestEL.textContent = sg;
        selectWordEl.style.display = "flex";
        resultEl.style.display = "none";
        arrAnswer = getArrayCharacter(nowPack[q - 1].answer);
        time = 30;
    } else {
        alert("Bạn đã hoàn thành tất cả câu hỏi");
    }
}

// Khởi tạo trạng thái khi bắt đầu game
const initPlayingState = function () {
    playing = true;
    startZone.style.display = "none";
    playingZone.style.display = "block";
    allPacks = createPacksQuestion();
    nowPack = allPacks[0];
    displayQuestion(nowPack[0]);
    arrAnswer = getArrayCharacter(nowPack[q - 1].answer);   // Tạo ra gợi ý
    countdown();
}

// Hàm mở modal
const openModal = function () {
    modal.show();
}

// Hàm đóng modal
const closeModal = function () {
    modal.hide();
}

// Hàm lưu các team vào Local Storage sau khi khởi tạo
const initTeamsToLocalStorage = function (teamsName) {
    const teams = teamsName.map(name => ({
        name: name,
        score: 0
    }));
    localStorage.setItem("teams", JSON.stringify(teams));
}

// Xếp hạng dựa trên điểm số
const ranking = function () {
    if (!localStorage.getItem("teams")) {
        alert("Không tồn tại mảng dữ liệu xếp hạng. Kiểm tra lại code!");
    }
    const teams = JSON.parse(localStorage.getItem("teams"));
    // Sort lại mảng teams để sắp xếp từ cao đến thấp
    teams.sort((a, b) => b.score - a.score);
    console.log(teams);
}

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
})

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
    document.querySelector(".btn-agree").setAttribute('data-request', 'test-modal');
    openModal();
});

// Hàm handle khi click nút Đồng ý (Đây là hàm chung, chia switch case để handle các trường hợp khi ấn nút đồng ý)
btnAgree.addEventListener("click", function () {
    const requestValue = document.querySelector(".btn-agree").getAttribute('data-request');

    switch (requestValue) {
        case 'test-modal':
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

btnPlaying.addEventListener("click", function () {
    if (!playing) {
        initPlayingState()
    }
})
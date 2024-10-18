"use strict";
// Select element
const scoreEl = document.querySelector(".score");
const timeEl = document.querySelector(".time");
const imageEl = document.querySelector("img");
const answerEl = document.querySelector("#answer");
const selectWordEl = document.querySelector(".select_word");
const btnSuggest = document.querySelector(".btn_suggest");
const btnNext = document.querySelector(".btn_next");
const resultEl = document.querySelector("#result");
const statusResultEl = document.querySelector(".status_result");
const answerResultEl = document.querySelector(".answer_result");
const suggestEL = document.querySelector(".suggest");

let q = 1;
let score = 0;
let sg = 5;
let arrCharacterAnswer = [];
let len;
let arrAnswer;
let time = 30;
let intervalID;

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

// Function next question
const nextQuestion = function () {
    clearInterval(intervalID);
    if (q < questions.length) {
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
        alert("Bạn đã hoàn thành tất cả câu hỏi");
    }
}

displayQuestion(questions[0]);
countdown();

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
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
let sg = 3;
let arrCharacterAnswer = [];
let len;
let arrAnswer;
let time = 30;
let intervalID;

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

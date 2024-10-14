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
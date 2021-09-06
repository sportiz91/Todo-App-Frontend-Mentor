//DOM Queries:
const theBody = document.querySelector("body"); //select all the body
const themeButton = document.querySelector("[data-theme-button]"); //select theme button
const backgroundImage = document.querySelector("[data-background-image]"); //select div

const KEY_THEME = "keyTheme";
let VALUE_THEME;
const USER_THEME = localStorage.getItem(KEY_THEME);

//Event Listeners:
themeButton.addEventListener("click", () => {
  if (theBody.classList.contains("light-theme") === true) {
    VALUE_THEME = "dark";
    localStorage.setItem(KEY_THEME, VALUE_THEME);
    darkTheme();
  } else {
    VALUE_THEME = "light";
    localStorage.setItem(KEY_THEME, VALUE_THEME);
    lightTheme();
  }
});

function darkTheme() {
  theBody.classList.remove("light-theme");
  backgroundImage.classList.remove("light");
  backgroundImage.classList.add("dark");
  themeButton.src = "./images/icon-sun.svg";
}

function lightTheme() {
  theBody.classList.add("light-theme");
  backgroundImage.classList.remove("dark");
  backgroundImage.classList.add("light");
  themeButton.src = "./images/icon-moon.svg";
}

function loadingTheme() {
  if (USER_THEME == "null" || USER_THEME == "") return;

  if (USER_THEME === "light") {
    lightTheme();
  } else {
    darkTheme();
  }
}

loadingTheme();

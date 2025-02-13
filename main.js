let USERNAME;
let POINT = 1000;
let game_id;

// элементы
let points = document.getElementsByClassName("point");
const gameBtn = document.getElementById("gameBtn");

// слушатели
document
  .querySelector("#loginWrapper form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    auth();
  });

[...points].forEach((elem) => elem.addEventListener("click", addPoint));

gameBtn.addEventListener("click", startOrStepGame);

// регистрация
async function auth() {
  const loginWrapper = document.getElementById("loginWrapper");
  const login = document.getElementById("login").value;
  let response = await sendRequest("user", "GET", { username: login });

  if (response.error) {
    alert("You haven't logged in yet.");
    let registration = await sendRequest("user", "POST", { username: login });

    if (!registration.error) {
      alert("You have been logged in.");
      loginWrapper.style.display = "none";
      USERNAME = login; // Исправлено: берем имя из input
      updateUserBalance();
    }
  } else {
    USERNAME = response.username;
    loginWrapper.style.display = "none";
    updateUserBalance();
  }
}

async function updateUserBalance() {
  let response = await sendRequest("user", "GET", { username: USERNAME });

  if (response.error) {
    alert(response.message);
  } else {
    const user = document.querySelector("header span");
    user.innerHTML = `Пользователь: ${response.username}, Баланс: ${response.balance}`;
  }
}

function addPoint(event) {
  let activePoints = document.querySelector(".point.active");
  if (activePoints) {
    activePoints.classList.remove("active");
  }
  event.target.classList.add("active");
}

function startOrStepGame() {
  if (gameBtn.innerHTML === "GAME") {
    gameBtn.innerHTML = "GAME OVER";
    gameBtn.style.backgroundColor = "red";
    startGame();
  } else {
    gameBtn.innerHTML = "GAME";
    gameBtn.style.backgroundColor = "#66a663";
    stopGame()
  }
}

async function startGame() {
  const payload = {
    username: USERNAME,
    points: POINT,
  };

  let response = await sendRequest("new_game", "POST", payload);

  if (response.error) {
    alert(response.message);
    gameBtn.innerHTML = "GAME IN";
    gameBtn.style.backgroundColor = "#66a663";
  } else {
    updateUserBalance();
    game_id = response.game_id;
    activateArea();
  }
}

 async function stopGame() {
  const response = await sendRequest(" stop_game" , "POST",{
    username : USERNAME , 
    game_id, 
    })
    updateUserBalance()
    resetField()
}


function activateArea() {
  let field = document.getElementsByClassName("field");

  if (field.length === 0) {
    console.error("No elements with class 'field' found!");
    return;
  }

  for (let i = 0; i < field.length; i++) {
    const row = Math.trunc (i / 10) 
    const column = i - row * 10
    field[i].addEventListener("contextmenu", setFlag)
    field[i].setAttribute("data-row", row)
    field[i].setAttribute("data-column", column)
    field[i].addEventListener("click" , makeStep)
    setTimeout(() => {
      field[i].classList.add("active");
    }, i * 30);
  }
}
async function makeStep() {
  const target = event.target;

  const row = +target.getAttribute("data-tow");
  const column = +target.getAttribute("data-column");
 try {
  const response = await sendRequest (" game_step" , "POST" , {
    game_id,
    row : row,
    column : column,
  }) ;
  if (response.error) {
    alert(response.message)
  }else{
    if (response.status === "ok") {
      
    } else if (response.status === "Failed"){
      alert("you failed")
      updateUserBalance()
      gameBtn.innerHTML = "GAME";
      gameBtn.style.backgroundColor = "#66a663";
      setTimeout(()=>{resetField()}, 2000)
    }else if (response.status === "Won"){
      alert("you are winner")
      updateUserBalance()
      gameBtn.innerHTML = "GAME";
      gameBtn.style.backgroundColor = "#66a663";
      setTimeout(()=>{resetField()}, 2000)
    }
  }
 } catch (error) {
  console.error(error);
 } 
}

function updateArea(table) {
  let field = document.querySelector(".field")
  let a = 0
  for (let i = 0; i < table.length; i++) {
    let row = table [i];
    for (let j = 0; j < row.length; j++) {
      let cell = row[j];
      let value = field[a];
      if (cell === "") {
        
      } else if ((cell === 0 )) {
        value.classList.remove("active")
      }else if ((cell === "BOMB")) {
        value.classList.remove("active")
        value.classList.add("bomb")
      } else if (cell > 0) {
        value.classList.remove("active")
        value.innerHTML = cell 
      }
      a++
    }
    
  }
}

function setFlag(event) {
  event.preventDefault()
  let target = event.target
  target.classList.toggle("flag")

}

function resetField() {
  const gameField = document.querySelector(".gameField");
  for ( let i=0; i<80 ; i++){
    const field = document.createElement("div")
    field.classList.add("field")
    gameField.appendChild(field)
  }
}
resetField()
async function sendRequest(url, method, data) {
  url = `https://tg-api.tehnikum.school/tehnikum_course/minesweeper/${url}`;

  if (method === "POST") {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    response = await response.json();
    return response;
  } else if (method === "GET") {
    if (Object.keys(data).length > 0) {
      url += "?" + new URLSearchParams(data);
    }
    let response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    response = await response.json();
    return response;
  }
}


function setFadeIn(){

}

function setFadeOut(){

}

async function setRenderBackground(bg) {
    const { data } = await axios.get('https://picsum.photos/1280/720', {
        // blob 속성은 이미지, 사운드, 비디오등의 멀티미디어 데이터를 다룰 때 사용
        responseType: 'blob',
    });
    // 현재 사용하고있는 페이지에서만 유효한 임시의 URL을 생성
    const imageURL = URL.createObjectURL(data);
    //document.querySelector(`"#${bg}"`).style.backgroundImage = `url(${imageURL})`;
    document.body.style.backgroundImage = `url(${imageURL})`;
}

function setTime() {
    const timer = document.querySelector('.timer');
    const timerContent = document.querySelector('.timer-content');
    
    setInterval(() => {
        const date = new Date();
        //console.log(date);
        

        timer.textContent = `${('0'+ date.getHours()).slice(-2)}:${('0'+date.getMinutes()).slice(-2)}:${('0'+date.getSeconds()).slice(-2)}`;

        if(date.getHours() >= 6 && date.getHours() <= 11){
            timerContent.textContent = "Good Morning! Gunju.";
        }
        if(date.getHours() >=12 && date.getHours() <= 16){
            timerContent.textContent = "Good Afternoon! Gunju.";
        }
        if(date.getHours() >=17 && date.getHours() <= 20){
            timerContent.textContent = "Good Evening! Gunju.";
        }
        if(date.getHours() >=21){
            timerContent.textContent = "Good Night! Gunju.";
        }
    }, 500);
}

// 메모를 불러와서 html에 그려주는
// renderingMemo
function renderingMemo() {
    const memo = document.querySelector('.memo');
    const memoValue = localStorage.getItem('todo');
    // html 변경
    memo.textContent = memoValue;

}

function setMemo() {
    const memoInput = document.querySelector('.memo-input');
    memoInput.addEventListener('keyup', function (e) {
        // e.target.value !== undefined
        // && e.target.value !== null
        // && e.target.value !== ""
        // && e.target.value !== 0 
        // 위 모두 동일 => e.target.value
        if (e.code === 'Enter' && e.target.value) {
            localStorage.setItem('todo', e.target.value);
            renderingMemo();
            memoInput.value = '';
        }
    });
}

function addDeleteMemoEvent() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('memo')) {
            // localStorage 로부터 데이터를 지운다
            localStorage.removeItem('todo');
            e.target.textContent = '';
        }
    });
}


function getPosition(options) {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

async function getWeatherAPI(latitude, longitude) {
    // 위도와 경도가 있는경우
    const API_KEY = '81f9f138dd342d258a9facf38a5a8b7b';
    if (latitude & longitude) {
        const result = await axios.get(
            `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        );

        return result;
    }
    // 위도와 경도가 없는경우
    // 없는경우에는 서울의 날씨데이터를 가져온다
    // api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}
    const result = await axios.get(`
    http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=${API_KEY}
    `);
    return result;
}

async function renderWeather() {
    let latitude = '';
    let longitude = '';

    try {
        // axios로 get하는 함수들은 await 활용
        const position = await getPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
    } catch (error) {
        console.log(error);
    }

    // 해당 위도 경도를 기반으로 날씨 API 불러오기
    // 날씨를 불러오는 API호출 함수 생성
    // console.log(latitude);
    // console.log(longitude);

    const weatherResult = await getWeatherAPI(latitude, longitude);

    // weatherResult.data.list

    const { list } = weatherResult.data;
    console.log(list);
    
    const date = new Date();
    const curHour = ('0'+ parseInt(date.getHours()/3) *3).slice(-2);
    const dateStr = date.toISOString().slice(0,10) + " "+ curHour +":00:00";
    console.log(dateStr);
    const todayWeather = list.find((el)=>(el.dt_txt === dateStr));
    console.log(todayWeather);

    

    const modalIcon = document.querySelector('.modal-icon');
    modalIcon.style.backgroundImage = `url('${matchIcon(todayWeather.weather[0].main)}')`;

    const modalText = document.querySelector('.modal-text');
    modalText.innerHTML = `(${curHour}:00:00 기준)`;


    // 18:00:00 의 정보만 가져온다
    const weatherList = list.reduce((acc, cur) => {

        if (cur.dt_txt.indexOf('18:00:00') > 0) {
            acc.push(cur);
        }
        return acc;
    }, []);

    console.log(weatherList);

    // modal body에 데이터를 기반으로 html 과 일치화
    const modalBody = document.querySelector('.modal-body');

    // list 담기
    modalBody.innerHTML = weatherList.map((li) => {
        return weatherWrapperComponent(li);
    })
}

function weatherWrapperComponent(li){
    console.log(li);
    const changeToCelsius = (temp)=> (temp - 273.15).toFixed(1);

    return `
    <div class="card shadow-sm bg-transparent mb-3 m-2 flex-grow-1" >
        <div class="card-header text-white text-center">
            ${li.dt_txt.split(" ")[0]}
        </div>

        <div class="card-body d-flex">
            <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <h5 class="card-title"> ${li.weather[0].main} </h5>
                <img src="${matchIcon(li.weather[0].main)}" width="60px" height="60px" />
                <p class="card-text">${changeToCelsius(li.main.temp)}˚</p>
            </div>
        </div>
    </div>
    `
}

function matchIcon(weatherData){
    if(weatherData === "Clear") return "./images/039-sun.png";
    if(weatherData === "Clouds") return "./images/001-cloud.png";
    if(weatherData === "Rain") return "./images/003-rainy.png";
    if(weatherData === "Snow") return "./images/006-snowy.png";
    if(weatherData === "Thunderstorm") return "./images/008-storm.png";
    if(weatherData === "Drizzle") return "./images/031-snowflake.png";
    if(weatherData === "Atmosphere") return "./images/033-hurricane.png";

}



// IIFE 즉시 실행함수
// 한번 실행되서 계속 Interval마다 재호출됨(무한루프)
(function () {
    setRenderBackground();
    setInterval(() => {
        setRenderBackground();
    }, 5000);
    // 시간 설정
    setTime();
    // 메모 설정
    setMemo();
    renderingMemo();
    addDeleteMemoEvent();
    renderWeather();
})();

let LottoDataList;

function loadPrevDataList() {
  const url = "https://script.google.com/macros/s/AKfycbyZTCQXFblfO2zl7uBrFMChafBh_Q-dFbtI4mCVNw1E2SV-FMxvNct9JkaB_ivdaDnuYA/exec";
  
  $.ajax({
    url: url,
    method: "GET",
    data: {},
    dataType: "json",
    cache: false,
    async: true,
    timeout: 60 * 1000
    , success: function (response, status, xhr) {
      //console.log("AJAX success : " + url);
      LottoDataList = response;
      init();
    }, error: function (jqXHR, textStatus, errorThrown) {
      console.log("AJAX error : " + url);
      console.log("status : " + jqXHR.status);
      console.log("textStatus : " + textStatus);
    }, complete: function (jqXHR, textStatus) {
      //console.log("AJAX complete : " + url);
    }
  });
  
}

loadPrevDataList();

function init() {
  const numbers = step_2();
  console.log(numbers);
  
  const circles = document.querySelectorAll('#output_number .number-circle');
  circles.forEach((circle, idx) => {
    const num = numbers[idx];
    // 숫자 삽입
    circle.textContent = num;
    // 숫자에 맞는 ball 클래스 추가
    const ballClass = getBallClass(num);
    if (ballClass) {
      circle.classList.add(ballClass);
    }
  });
  
  // 문서가 준비되면 실행
  $('#button-e0594213').on('click', function () {
    const $element = $('#output_number');
    html2canvas($element[0]).then(function (canvas) {
      // PNG로 저장 (기본값이 image/png)
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'lotto_number.png'; // 파일 확장자 png
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });
  
}

function getBallClass(num) {
  if (num >= 1 && num <= 10) return 'ball1';
  if (num >= 11 && num <= 20) return 'ball2';
  if (num >= 21 && num <= 30) return 'ball3';
  if (num >= 31 && num <= 40) return 'ball4';
  if (num >= 41 && num <= 50) return 'ball5';
  return '';
}

/**
 * 1이상 45이하의 무작위 숫자 6개를 겹치지 않게 뽑아줘.
 */
function step_1() {
  const number_arr = [];
  while (number_arr.length < 6) {
    const num = Math.floor(Math.random() * 45) + 1; // 1~45
    if (!number_arr.includes(num)) {
      number_arr.push(num);
    }
  }
  number_arr.sort((a, b) => a - b); // 오름차순 정렬 (선택사항)
  return number_arr;
}

/**
 * step_1 에서 뽑힌 숫자가 LottoDataList 에 있다면 다시 step_1 으로 돌아가서 다시 뽑아줘.
 */
/**
 * step_1 에서 뽑힌 숫자가 LottoDataList 에 있다면 다시 step_1 으로 돌아가서 다시 뽑아줘.
 */
function step_2() {
  const numbers = step_1();
  
  // LottoDataList가 배열이고, 각 요소가 숫자 배열이라고 가정
  // LottoDataList 내에 numbers 배열과 동일한 배열이 있는지 검사
  const exists = LottoDataList.some(prevNumbers => {
    if (!Array.isArray(prevNumbers)) return false;
    if (prevNumbers.length !== numbers.length) return false;
    
    // 두 배열이 같은 숫자를 같은 순서로 가지고 있는지 확인
    // 만약 LottoDataList 내 숫자 배열이 정렬되어 있지 않다면 정렬 후 비교 필요
    const sortedPrev = [...prevNumbers].sort((a, b) => a - b);
    const sortedCurr = [...numbers].sort((a, b) => a - b);
    
    return sortedPrev.every((num, idx) => num === sortedCurr[idx]);
  });
  
  if (exists) {
    // 이미 존재하는 조합이면 다시 뽑기
    return step_2();
  } else {
    return numbers;
  }
}



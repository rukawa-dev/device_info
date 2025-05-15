let tryCount = 0;
const console_k = 100;
const DUP_TARGET = 2; // 중복 횟수 설정

function getRandomLottoNumbers(Data) {
  let result_num;
  let step0, step1, step2, step3, step4;
  
  do {
    tryCount++;
    $(`#try_cnt`).text(tryCount);
    $(`.step-text`).removeClass('on');
    
    const numbers = Array.from({length: 45}, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    result_num = numbers.slice(0, 6).sort((a, b) => a - b);
    
    step0 = STEP_0(result_num);
    if (step0.pass) document.getElementById('step-0').classList.add('on');
    else {
      if (tryCount % 100 == 0) console.clear();
      console.log(`[탈락] ${step0.reason} → ${step0.numbers.join(', ')}`);
    }
    
    step1 = STEP_1(Data, result_num);
    if (step1.pass) document.getElementById('step-1').classList.add('on');
    else {
      if (tryCount % console_k == 0) console.clear();
      console.log(`[탈락] ${step1.reason} → ${step1.numbers.join(', ')}`);
    }
    
    step2 = STEP_2(Data, result_num);
    if (step2.pass) document.getElementById('step-2').classList.add('on');
    else {
      if (tryCount % console_k == 0) console.clear();
      console.log(`[탈락] ${step2.reason} → ${step2.numbers.join(', ')}`);
    }
    
    step3 = STEP_3(result_num);
    if (step3.pass) document.getElementById('step-3').classList.add('on');
    else {
      if (tryCount % console_k == 0) console.clear();
      console.log(`[탈락] ${step3.reason} → ${step3.numbers.join(', ')}`);
    }
    
    step4 = STEP_4(result_num);
    if (step4.pass) document.getElementById('step-4').classList.add('on');
    else {
      if (tryCount % console_k == 0) console.clear();
      console.log(`[탈락] ${step4.reason} → ${step4.numbers.join(', ')}`);
    }
    
  } while (
    !step0.pass ||
    !step1.pass ||
    !step2.pass ||
    !step3.pass ||
    !step4.pass
    );
  return result_num;
}

function STEP_0(candidate) {
  // #want-num에서 입력값 읽기
  const wantStr = $('#want-num').val();
  if (!wantStr) return {pass: true}; // 입력 없으면 통과
  
  // 입력값을 숫자 배열로 변환
  const wantNums = wantStr.split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n));
  
  // 모든 원하는 숫자가 candidate에 포함되어 있는지 확인
  const allIncluded = wantNums.every(num => candidate.includes(num));
  if (allIncluded) {
    return {pass: true};
  } else {
    return {
      pass: false,
      reason: `STEP_0: 원하는 숫자(${wantNums.join(',')}) 미포함`,
      numbers: candidate.slice()
    };
  }
}

function STEP_1(Data, candidate) {
  if (!Array.isArray(Data) || Data.length === 0) return {pass: true};
  const candStr = candidate.slice().sort((a, b) => a - b).join(',');
  for (const item of Data) {
    if (item.select && item.select.length === 6) {
      const winStr = item.select.slice().sort((a, b) => a - b).join(',');
      if (candStr === winStr) {
        return {pass: false, reason: 'STEP_1: 역대 당첨번호와 일치', numbers: candidate.slice()};
      }
    }
  }
  return {pass: true};
}

function STEP_2(Data, candidate) {
  if (!Array.isArray(Data) || Data.length === 0) return {pass: true};
  if (typeof Data._minSum !== 'number' || typeof Data._maxSum !== 'number') {
    let minSum = Infinity, maxSum = -Infinity;
    for (const item of Data) {
      if (item.select && item.select.length === 6) {
        const sum = item.select.reduce((a, b) => a + b, 0);
        if (sum < minSum) minSum = sum;
        if (sum > maxSum) maxSum = sum;
      }
    }
    Data._minSum = minSum;
    Data._maxSum = maxSum;
  }
  const sum = candidate.reduce((a, b) => a + b, 0);
  const range = (Data._maxSum - Data._minSum) / 4;
  const lower = Data._minSum + range;
  const upper = Data._maxSum - range;
  if (sum >= lower && sum <= upper) {
    return {pass: true};
  } else {
    return {pass: false, reason: `STEP_2: 합(${sum})이 범위(${Math.round(lower)}~${Math.round(upper)}) 밖`, numbers: candidate.slice()};
  }
}

function STEP_3(candidate) {
  let oddCount = 0;
  for (const num of candidate) {
    if (num % 2 !== 0) oddCount++;
  }
  const evenCount = candidate.length - oddCount;
  if (
    (oddCount === 3 && evenCount === 3) ||
    (oddCount === 2 && evenCount === 4) ||
    (oddCount === 4 && evenCount === 2)
  ) {
    return {pass: true};
  } else {
    return {pass: false, reason: `STEP_3: 홀짝비(${oddCount}:${evenCount}) 불일치`, numbers: candidate.slice()};
  }
}

function STEP_4(candidate) {
  let maxSeq = 1;
  let currentSeq = 1;
  for (let i = 1; i < candidate.length; i++) {
    if (candidate[i] === candidate[i - 1] + 1) {
      currentSeq++;
      if (currentSeq > maxSeq) maxSeq = currentSeq;
    } else {
      currentSeq = 1;
    }
  }
  if (maxSeq <= 2) {
    return {pass: true};
  } else {
    return {pass: false, reason: `STEP_4: 연속수 ${maxSeq}개 초과`, numbers: candidate.slice()};
  }
}

function getBallClass(num) {
  if (num >= 1 && num <= 10) return 'ball1';
  if (num >= 11 && num <= 20) return 'ball2';
  if (num >= 21 && num <= 30) return 'ball3';
  if (num >= 31 && num <= 40) return 'ball4';
  if (num >= 41 && num <= 50) return 'ball5';
  return '';
}

function renderRecommendWithDupCheck(Data) {
  tryCount = 0;
  
  const tbody = document.querySelector('#result_table tbody');
  tbody.innerHTML = '';
  
  const countMap = new Map();
  let finalSet = null;
  let attemptCount = 0;
  
  function findDuplicateAsync() {
    let found = false;
    for (let i = 0; i < 10; i++) {
      attemptCount++;
      $(`#try_cnt`).text(attemptCount + tryCount);
      
      const recommend = getRandomLottoNumbers(Data);
      const key = recommend.join(',');
      const currentCount = (countMap.get(key) || 0) + 1;
      countMap.set(key, currentCount);
      
      if (currentCount === DUP_TARGET) {
        finalSet = recommend;
        found = true;
        break;
      }
    }
    if (found) {
      $(`#final-step`).addClass('on');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <th style="width:50px;">최종 추천</th>
        <td>
          <span class="number-circle ${getBallClass(finalSet[0])}">${finalSet[0]}</span>
          <span class="number-circle ${getBallClass(finalSet[1])}">${finalSet[1]}</span>
          <span class="number-circle ${getBallClass(finalSet[2])}">${finalSet[2]}</span>
          <span class="number-circle ${getBallClass(finalSet[3])}">${finalSet[3]}</span>
          <span class="number-circle ${getBallClass(finalSet[4])}">${finalSet[4]}</span>
          <span class="number-circle ${getBallClass(finalSet[5])}">${finalSet[5]}</span>
        </td>
        <td>
          <input type="text" value="${finalSet.join(',')}" onclick="this.select()" style="outline:none; border:none; text-align:center; font-size:inherit;"/>
        </td>
      `;
      tbody.appendChild(tr);
      console.log(`SETP_5 : 총 ${attemptCount}개의 번호 세트를 생성하여 행운 번호를 찾았습니다.`);
    } else {
      setTimeout(findDuplicateAsync, 0);
    }
  }
  
  findDuplicateAsync();
}

/**
 * 1~45 사이의 중복 없는 6개 번호를 무작위로 뽑아 오름차순 정렬해서 반환
 * - STEP_1: 역대 당첨번호와 완전히 일치하지 않을 것
 * - STEP_2: 6개 번호의 합이 (최소합 + (최대합-최소합)/4) 이상 (최대합 - (최대합-최소합)/4) 이하일 것
 * - STEP_3: 최근 6개월(26주) 미출현 번호가 1개 이상 포함될 것
 * - STEP_3: 홀수와 짝수의 비율이 3:3 또는 2:4 또는 4:2 일 것
 * - STEP_4: 연속되는 번호는 2개 이하일 것
 */
function getRandomLottoNumbers(Data) {
  let result_num;
  let tryCount = 0;
  let step1, step2, step3, step4; // 변수 선언 위치 변경
  
  do {
    tryCount++;
    
    // 모든 STEP 클래스 초기화
    $(`.step-text`).removeClass('on');
    
    const numbers = Array.from({length: 45}, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    result_num = numbers.slice(0, 6).sort((a, b) => a - b);
    
    // 각 STEP 검사 및 클래스 추가
    step1 = STEP_1(Data, result_num);
    if (step1) document.getElementById('step-1').classList.add('on');
    
    step2 = STEP_2(Data, result_num);
    if (step2) document.getElementById('step-2').classList.add('on');
    
    step3 = STEP_3(result_num);
    if (step3) document.getElementById('step-3').classList.add('on');
    
    step4 = STEP_4(result_num);
    if (step4) document.getElementById('step-4').classList.add('on');
    
  } while (
    !step1 ||
    !step2 ||
    !step3 ||
    !step4
    );
  return result_num;
}

/**
 * STEP_1: 역대 당첨 번호와 중복되지 않는지 체크
 */
function STEP_1(Data, candidate) {
  if (!Array.isArray(Data) || Data.length === 0) return true;
  const candStr = candidate.slice().sort((a, b) => a - b).join(',');
  for (const item of Data) {
    if (item.select && item.select.length === 6) {
      const winStr = item.select.slice().sort((a, b) => a - b).join(',');
      if (candStr === winStr) return false;
    }
  }
  return true;
}

/**
 * STEP_2: 추천번호 6개 합이 (최소합 + 범위/4) 이상 (최대합 - 범위/4) 이하일 때 true
 */
function STEP_2(Data, candidate) {
  if (!Array.isArray(Data) || Data.length === 0) return true;
  // 최소/최대값 캐싱
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
  return sum >= lower && sum <= upper;
}

/**
 * STEP_3: 홀수와 짝수의 비율이 3:3 또는 2:4 또는 4:2 인지 확인
 */
function STEP_3(candidate) {
  let oddCount = 0;
  for (const num of candidate) {
    if (num % 2 !== 0) oddCount++;
  }
  const evenCount = candidate.length - oddCount;
  return (
    (oddCount === 3 && evenCount === 3) ||
    (oddCount === 2 && evenCount === 4) ||
    (oddCount === 4 && evenCount === 2)
  );
}

/**
 * STEP_4: 연속되는 번호가 2개 이하일 때만 true 반환
 */
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
  return maxSeq <= 2;
}

/**
 * 추천 번호 세트가 n번 중복될 때까지 생성 후 단일 세트 표시
 */
function renderRecommendWithDupCheck(Data) {
  const DUP_TARGET = 2; // 중복 횟수 설정
  const tbody = document.querySelector('#result_table tbody');
  tbody.innerHTML = ''; // 기존 행 삭제
  
  const countMap = new Map();
  let finalSet = null;
  let attemptCount = 0;
  
  // 비동기 루프 함수
  function findDuplicateAsync() {
    let found = false;
    // 한 번에 100회씩 처리 (UI 멈춤 방지)
    for (let i = 0; i < 10; i++) {
      attemptCount++;
      
      // tryCount를 #try_cnt에 출력
      const tryCntElem = document.getElementById('try_cnt');
      if (tryCntElem) tryCntElem.textContent = attemptCount;
      
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
      // 결과 표시
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <th>최종추천</th>
        <td>${finalSet.map(num => `${num}`).join(',')}</td>
      `;
      tbody.appendChild(tr);
      console.log(`총 ${attemptCount}개의 번호 세트를 생성하여 ${DUP_TARGET}번 중복된 번호를 찾았습니다.`);
    } else {
      // 다음 batch를 비동기적으로 실행
      setTimeout(findDuplicateAsync, 0);
    }
  }
  
  // 시작
  findDuplicateAsync();
}


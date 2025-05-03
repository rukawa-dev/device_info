/**
 * 1~45 사이의 중복 없는 6개 번호를 무작위로 뽑아 오름차순 정렬해서 반환
 * - STEP_1: 역대 당첨번호와 완전히 일치하지 않을 것
 * - STEP_2: 6개 번호의 합이 (최소합 + (최대합-최소합)/4) 이상 (최대합 - (최대합-최소합)/4) 이하일 것
 * - STEP_4: 홀수와 짝수의 비율이 3:3 또는 2:4 또는 4:2 일 것
 * - STEP_5: 연속되는 번호는 2개 이하일 것
 */
function getRandomLottoNumbers(Data) {
  let result_num;
  let tryCount = 0;
  do {
    tryCount++;
    const numbers = Array.from({length: 45}, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    result_num = numbers.slice(0, 6).sort((a, b) => a - b);
    
    const step1 = STEP_1(Data, result_num);
    const step2 = STEP_2(Data, result_num);
    const step4 = STEP_4(result_num);
    const step5 = STEP_5(result_num);
    
    if (step1) console.log(`STEP_1 통과: [${result_num.join(', ')}]`);
    else console.log(`STEP_1 실패(중복): [${result_num.join(', ')}]`);
    
    if (step2) console.log(`STEP_2 통과: 합=${result_num.reduce((a, b) => a + b, 0)}`);
    else console.log(`STEP_2 실패(합이 허용 범위 벗어남): 합=${result_num.reduce((a, b) => a + b, 0)}`);
    
    if (step4) console.log(`STEP_4 통과: 홀짝 비율 만족`);
    else console.log(`STEP_4 실패: 홀짝 비율 불만족`);
    
    if (step5) console.log(`STEP_5 통과: 연속번호 조건 만족`);
    else console.log(`STEP_5 실패: 연속번호 3개 이상`);
    
    if (step1 && step2 && step4 && step5) {
      console.log(`추천번호 생성 완료 (시도 횟수: ${tryCount})`);
    }
  } while (
    !STEP_1(Data, result_num) ||
    !STEP_2(Data, result_num) ||
    !STEP_4(result_num) ||
    !STEP_5(result_num)
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
    console.log(`[STEP_2] 최소합: ${minSum}, 최대합: ${maxSum}`);
  }
  const sum = candidate.reduce((a, b) => a + b, 0);
  const range = (Data._maxSum - Data._minSum) / 4;
  const lower = Data._minSum + range;
  const upper = Data._maxSum - range;
  console.log(`[STEP_2] 추천번호 합: ${sum}, 허용범위: ${lower} ~ ${upper}`);
  return sum >= lower && sum <= upper;
}

/**
 * STEP_3: 최근 6개월(26주) 이상 한 번도 출현하지 않은 번호가
 * 추천번호에 1개 이상 포함되어야 true 반환
 * 콘솔에 미출현 번호도 출력!
 * @param {Array} Data - 역대 당첨번호 배열 (최신이 맨 앞)
 * @param {number[]} candidate - 추천 6개 번호
 * @returns {boolean}
 */
function STEP_3(Data, candidate) {
  if (!Array.isArray(Data) || Data.length === 0) return true;
  
  // 최근 26주(6개월) 당첨번호 집합 만들기 (최신이 맨 앞이라고 가정)
  const recentWeeks = 26;
  const appeared = new Set();
  for (let i = 0; i < Math.min(recentWeeks, Data.length); i++) {
    const item = Data[i];
    if (item.select && item.select.length === 6) {
      item.select.forEach(n => appeared.add(Number(n)));
    }
  }
  
  // 1~45 중 최근 6개월간 한 번도 안 나온 번호 리스트
  const missed = [];
  for (let n = 1; n <= 45; n++) {
    if (!appeared.has(n)) missed.push(n);
  }
  
  // 콘솔에 출력
  if (missed.length === 0) {
    console.log("[STEP_3] 6개월 이상 출현하지 않은 번호 없음");
  } else {
    console.log(`[STEP_3] 6개월 이상 미출현 번호: ${missed.join(', ')}`);
  }
  
  // 추천번호에 반드시 1개 이상 포함돼야 함
  const hasMissed = candidate.some(n => missed.includes(n));
  return hasMissed;
}

/**
 * STEP_4: 홀수와 짝수의 비율이 3:3 또는 2:4 또는 4:2 인지 확인
 */
function STEP_4(candidate) {
  let oddCount = 0;
  for (const num of candidate) {
    if (num % 2 !== 0) oddCount++;
  }
  const evenCount = candidate.length - oddCount;
  console.log(`[STEP_4] 홀수 ${oddCount}개, 짝수 ${evenCount}개`);
  return (
    (oddCount === 3 && evenCount === 3) ||
    (oddCount === 2 && evenCount === 4) ||
    (oddCount === 4 && evenCount === 2)
  );
}

/**
 * STEP_5: 연속되는 번호가 2개 이하일 때만 true 반환
 */
function STEP_5(candidate) {
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
  console.log(`[STEP_5] 최대 연속 개수: ${maxSeq}`);
  return maxSeq <= 2;
}

/**
 * 추천번호 5세트를 생성해서 result_table에 모두 표시
 */
function renderRecommend(Data) {
  const tbody = document.querySelector('#result_table tbody');
  tbody.innerHTML = ''; // 기존 행 삭제
  
  for (let i = 0; i < 5; i++) {
    const recommend = getRandomLottoNumbers(Data);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>추천${i + 1}</td>
      <td>-</td>
      <td>${recommend[0]}</td>
      <td>${recommend[1]}</td>
      <td>${recommend[2]}</td>
      <td>${recommend[3]}</td>
      <td>${recommend[4]}</td>
      <td>${recommend[5]}</td>
    `;
    tbody.appendChild(tr);
  }
}


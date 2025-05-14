let Data = [];

function loadLottoData() {
  // AJAX로 바이너리 데이터 요청
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/lotto_data.xlsx', true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function (e) {
    if (xhr.status !== 200) {
      alert('파일을 불러올 수 없습니다.');
      return;
    }
    // 엑셀 바이너리 → 워크북 객체
    const data = new Uint8Array(xhr.response);
    const workbook = XLSX.read(data, {type: 'array'});
    // 첫 시트 사용 (시트명은 환경에 따라 다름)
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // 시트를 2차원 배열로 변환
    const rows = XLSX.utils.sheet_to_json(sheet, {header: 1});
    // 데이터 파싱 (헤더, 번호행 건너뜀)
    Data = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0] || !row[1]) continue; // 빈 행 skip
      Data.push({
        no: String(row[0]),
        date: row[1],
        select: [row[2], row[3], row[4], row[5], row[6], row[7]].map(Number)
      });
    }
    // 결과 확인
    renderTable();
    
    //renderRecommend(Data);
    renderRecommendWithDupCheck(Data);
  };
  xhr.send();
}

function renderTable() {
  const tbody = document.querySelector('#history_table tbody');
  // 기존 행(샘플, 헤더 등) 모두 삭제
  tbody.innerHTML = '';
  // 데이터 행 추가
  for (const item of Data) {
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td>${item.no}</td>
           <td>${item.date}</td>
           <td>${item.select[0]}</td>
           <td>${item.select[1]}</td>
           <td>${item.select[2]}</td>
           <td>${item.select[3]}</td>
           <td>${item.select[4]}</td>
           <td>${item.select[5]}</td>`;
    tbody.appendChild(tr);
  }
}

window.onload = loadLottoData;

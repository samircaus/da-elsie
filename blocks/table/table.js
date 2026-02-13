function buildTableFromDivs(tableWrapper) {
  const rowDivs = [...tableWrapper.querySelectorAll(':scope > div')];
  if (rowDivs.length === 0) return null;

  const table = document.createElement('table');
  for (const rowDiv of rowDivs) {
    const cellDivs = rowDiv.querySelectorAll(':scope > div');
    const tr = document.createElement('tr');
    for (const cell of cellDivs) {
      const td = document.createElement('td');
      td.innerHTML = cell.innerHTML;
      tr.append(td);
    }
    table.append(tr);
  }
  tableWrapper.innerHTML = '';
  tableWrapper.append(table);
  return table;
}

export default function init(el) {
  const tableWrapper = el.classList.contains('table') ? el : el.querySelector('.table');
  if (tableWrapper && !tableWrapper.querySelector('table')) {
    buildTableFromDivs(tableWrapper);
  }

  const tables = el.querySelectorAll('table');
  for (const table of tables) {
    let thead = table.querySelector('table > thead');
    const rows = [...table.querySelectorAll('tr')];

    if (!thead) {
      thead = document.createElement('thead');
      table.prepend(thead);

      const headingRow = rows.shift();
      if (headingRow) {
        thead.append(headingRow);
        const tds = headingRow.querySelectorAll(':scope > td');
        for (const td of tds) {
          const th = document.createElement('th');
          th.className = td.className;
          th.innerHTML = td.innerHTML;
          td.parentElement.replaceChild(th, td);
        }
      }
    }

    for (const row of rows) {
      row.classList.add('table-content-row');
    }
  }
}

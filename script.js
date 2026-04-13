async function loadPapers() {
  const response = await fetch('papers.json');
  if (!response.ok) {
    throw new Error('无法读取 papers.json');
  }
  return await response.json();
}

function uniq(arr) {
  return [...new Set(arr)];
}

function formatDate(dateStr) {
  return dateStr || '未知日期';
}

function createPaperCard(paper) {
  const tags = (paper.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('');
  const abstract = paper.summary || '暂无摘要。';
  const detailUrl = paper.url || '#';
  const doiUrl = paper.doi_url || '';
  const openalexUrl = paper.openalex_url || '';

  return `
    <article class="paper">
      <div class="paper-head">
        <div>
          <h3>${paper.title}</h3>
          <div class="meta">${paper.journal} · ${formatDate(paper.date)}</div>
        </div>
        <a class="btn" href="${detailUrl}" target="_blank" rel="noopener noreferrer">查看详情</a>
      </div>
      <p class="muted" style="margin-top:12px">${abstract}</p>
      <div class="tags" style="margin-top:14px">${tags}</div>
      <div class="link-row">
        ${doiUrl ? `<a class="btn secondary" href="${doiUrl}" target="_blank" rel="noopener noreferrer">DOI</a>` : ''}
        ${openalexUrl ? `<a class="btn secondary" href="${openalexUrl}" target="_blank" rel="noopener noreferrer">OpenAlex</a>` : ''}
      </div>
    </article>
  `;
}

function renderJournalPool(journals) {
  document.getElementById('journalPool').innerHTML = journals.map(j => `<span class="tag">${j}</span>`).join('');
}

function renderKeywordPool(tags) {
  document.getElementById('keywordPool').innerHTML = tags.map(t => `<span class="tag blue">${t}</span>`).join('');
}

function renderTrend(tags, papers) {
  const counts = {};
  papers.forEach(p => (p.tags || []).forEach(t => counts[t] = (counts[t] || 0) + 1));
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 6);

  const maxValue = sorted.length ? sorted[0][1] : 1;
  document.getElementById('trendContainer').innerHTML = sorted.map(([tag, count]) => `
    <div class="trend">
      <div class="trend-row"><span>${tag}</span><span>${count}</span></div>
      <div class="bar"><span style="width:${(count / maxValue) * 100}%"></span></div>
    </div>
  `).join('');
}

function populateFilters(journals, tags) {
  const journalFilter = document.getElementById('journalFilter');
  const tagFilter = document.getElementById('tagFilter');

  journals.forEach(j => {
    const opt = document.createElement('option');
    opt.value = j;
    opt.textContent = j;
    journalFilter.appendChild(opt);
  });

  tags.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    tagFilter.appendChild(opt);
  });
}

function sortPapers(papers, mode) {
  const copy = [...papers];
  if (mode === 'date_asc') {
    copy.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  } else if (mode === 'title_asc') {
    copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else {
    copy.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }
  return copy;
}

function filterPapers(papers) {
  const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
  const journal = document.getElementById('journalFilter').value;
  const tag = document.getElementById('tagFilter').value;
  const sortMode = document.getElementById('sortFilter').value;

  let filtered = papers.filter(p => {
    const haystack = [
      p.title || '',
      p.summary || '',
      p.journal || '',
      ...(p.tags || [])
    ].join(' ').toLowerCase();

    const keywordOk = !keyword || haystack.includes(keyword);
    const journalOk = !journal || p.journal === journal;
    const tagOk = !tag || (p.tags || []).includes(tag);
    return keywordOk && journalOk && tagOk;
  });

  return sortPapers(filtered, sortMode);
}

function renderPapers(papers) {
  const container = document.getElementById('papersContainer');
  const emptyState = document.getElementById('emptyState');
  const resultCount = document.getElementById('resultCount');

  resultCount.textContent = papers.length;

  if (!papers.length) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  container.innerHTML = papers.map(createPaperCard).join('');
}

function bindControls(allPapers) {
  ['searchInput', 'journalFilter', 'tagFilter', 'sortFilter'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => renderPapers(filterPapers(allPapers)));
    document.getElementById(id).addEventListener('change', () => renderPapers(filterPapers(allPapers)));
  });
}

(async function init() {
  try {
    const papers = await loadPapers();
    const journals = uniq(papers.map(p => p.journal).filter(Boolean)).sort();
    const tags = uniq(papers.flatMap(p => p.tags || [])).sort();

    document.getElementById('paperCount').textContent = papers.length;
    document.getElementById('journalCount').textContent = journals.length;

    renderJournalPool(journals);
    renderKeywordPool(tags);
    renderTrend(tags, papers);
    populateFilters(journals, tags);
    bindControls(papers);
    renderPapers(sortPapers(papers, 'date_desc'));
  } catch (error) {
    document.getElementById('papersContainer').innerHTML = `
      <div class="empty-state">加载失败：${error.message}<br>请确认 papers.json 与网页文件在同一目录下。</div>
    `;
  }
})();

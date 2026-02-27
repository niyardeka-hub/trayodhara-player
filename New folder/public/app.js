const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const playerDiv = document.getElementById('player');
const coverImg = document.getElementById('cover');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const albumEl = document.getElementById('album');
const audioEl = document.getElementById('audio');
const downloadBtn = document.getElementById('downloadBtn');

searchBtn.addEventListener('click', async () => {
    const q = searchInput.value.trim();
    if (!q) return;
    resultsDiv.innerHTML = 'Searching...';
    try {
        const resp = await fetch(`/search?q=${encodeURIComponent(q)}`);
        const data = await resp.json();
        displayResults(data.tracks ? data.tracks.items : []);
    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = 'Error searching';
    }
});

function displayResults(items) {
    if (!items.length) {
        resultsDiv.innerHTML = '<p>No results</p>';
        return;
    }
    const ul = document.createElement('ul');
    items.forEach(track => {
        const li = document.createElement('li');
        li.textContent = `${track.title} — ${track.artist.name}`;
        li.addEventListener('click', () => selectTrack(track));
        ul.appendChild(li);
    });
    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(ul);
}

async function selectTrack(track) {
    // fetch detailed info from backend
    const infoResp = await fetch(`/info/${track.id}`);
    const info = await infoResp.json();

    coverImg.src = info.album ? info.album.cover : '';
    titleEl.textContent = info.title;
    artistEl.textContent = info.artist ? info.artist.name : '';
    albumEl.textContent = info.album ? info.album.title : '';

    // create a quality selector if not already existing
    if (!document.getElementById('qualitySelect')) {
        const sel = document.createElement('select');
        sel.id = 'qualitySelect';
        ['HI_RES_LOSSLESS','LOSSLESS','HIGH','LOW'].forEach(q => {
            const opt = document.createElement('option');
            opt.value = q;
            opt.textContent = q.replace(/_/g,' ');
            sel.appendChild(opt);
        });
        sel.addEventListener('change', () => loadTrack(track.id, sel.value));
        playerDiv.insertBefore(sel, audioEl);
    }

    // load default quality
    loadTrack(track.id, document.getElementById('qualitySelect')?.value || 'HI_RES_LOSSLESS');
    downloadBtn.href = `/download/${track.id}`;
    playerDiv.classList.remove('hidden');
}

async function loadTrack(id, quality) {
    try {
        const resp = await fetch(`/track/${id}?quality=${quality}`);
        const data = await resp.json();
        if (data.streamUrl) {
            audioEl.src = data.streamUrl;
        } else if (data.manifest) {
            // for DASH/FLAC manifests you might need a specialized player; for demo we ignore
            audioEl.src = data.previewUrl || '';
        } else if (data.previewUrl) {
            audioEl.src = data.previewUrl;
        }
        audioEl.play();
    } catch (err) {
        console.error(err);
    }
}

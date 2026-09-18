import { Router } from 'express';
import { execFile } from 'child_process';
import { promisify } from 'util';

const router = Router();
const exec = promisify(execFile);

// yt-dlp with android client bypasses YouTube bot detection on server IPs
async function ytdlpInfo(url) {
    const { stdout } = await exec('python', [
        '-m', 'yt_dlp', '--dump-json', '--no-playlist',
        '--extractor-args', 'youtube:player_client=android,tv_embedded',
        '--no-warnings', url
    ], { timeout: 25000 });
    return JSON.parse(stdout);
}

function safeTitle(title = '') {
    return title.replace(/[^\w\s.-]/g, '').trim().slice(0, 80) || 'media';
}

// ── Search ────────────────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Query required' });

    try {
        const resp = await fetch(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgIQAQ%3D%3D`,
            { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
        );
        const html = await resp.text();
        const match = html.match(/var ytInitialData = ({.+?});<\/script>/s);
        if (!match) return res.json({ results: [], total: 0 });

        const data = JSON.parse(match[1]);
        const contents = data?.contents?.twoColumnSearchResultsRenderer
            ?.primaryContents?.sectionListRenderer?.contents?.[0]
            ?.itemSectionRenderer?.contents || [];

        const results = contents
            .filter(c => c.videoRenderer)
            .slice(0, 12)
            .map(c => {
                const v = c.videoRenderer;
                const id = v.videoId;
                return {
                    yt_id: id,
                    title: v.title?.runs?.[0]?.text || 'Unknown',
                    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                    duration: v.lengthText?.simpleText || '',
                    channel: v.ownerText?.runs?.[0]?.text || '',
                };
            });

        res.json({ results, total: results.length });
    } catch (e) {
        res.status(500).json({ error: 'Search failed', detail: e.message });
    }
});

// ── Extract ───────────────────────────────────────────────────────────────────
router.get('/extract', async (req, res) => {
    const url = (req.query.url || '').trim();
    if (!url) return res.status(400).json({ error: 'URL required' });

    try {
        const info = await ytdlpInfo(url);
        const title = info.title;
        const yt_id = info.id;
        const thumbnail = info.thumbnail || `https://i.ytimg.com/vi/${yt_id}/hqdefault.jpg`;
        const safe = safeTitle(title);

        // Combined video+audio formats (android client gives these)
        const combined = (info.formats || [])
            .filter(f => f.height && f.acodec !== 'none' && f.vcodec !== 'none' && f.url && f.protocol === 'https')
            .sort((a, b) => b.height - a.height);

        // Audio-only formats (tv_embedded gives these)
        const audioFormats = (info.formats || [])
            .filter(f => f.vcodec === 'none' && f.acodec !== 'none' && f.url && f.protocol === 'https')
            .sort((a, b) => (b.abr || 0) - (a.abr || 0));

        const files = combined.map(f => ({
            format: `MP4 ${f.height}p`,
            height: f.height,
            yt_id,
            quality: `${f.height}`,
            size: f.filesize || f.filesize_approx || 0,
            stream_url: f.url,
            http_headers: f.http_headers || {},
            name: `${safe}_${f.height}p.mp4`,
        }));

        const audio_files = audioFormats.slice(0, 2).map((f, i) => ({
            format: i === 0 ? 'Audio HQ' : 'Audio LQ',
            height: 0,
            yt_id,
            quality: 'audio',
            size: f.filesize || f.filesize_approx || 0,
            stream_url: f.url,
            http_headers: f.http_headers || {},
            name: `${safe}_audio.${f.ext || 'm4a'}`,
            is_audio: true,
        }));

        if (!files.length && !audio_files.length) {
            return res.json({ status: 'unavailable', files: [], audio_files: [] });
        }

        res.json({ status: 'downloadable', title, yt_id, thumbnail, files, audio_files });
    } catch (e) {
        res.status(500).json({ error: 'Extract failed', detail: e.message });
    }
});

// ── Stream: proxy the googlevideo.com URL to browser ─────────────────────────
router.get('/stream', async (req, res) => {
    const { stream_url, filename } = req.query;
    if (!stream_url) return res.status(400).json({ error: 'Missing stream_url' });

    // Security: only allow googlevideo.com URLs
    if (!stream_url.includes('googlevideo.com') && !stream_url.includes('youtube.com')) {
        return res.status(400).json({ error: 'Invalid stream URL' });
    }

    const safeName = (filename || 'media').replace(/[^\w\s.-]/g, '');

    try {
        const upstream = await fetch(stream_url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
                'Referer': 'https://www.youtube.com/',
            },
        });
        if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);

        res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
        res.setHeader('Content-Type', upstream.headers.get('content-type') || 'video/mp4');
        const cl = upstream.headers.get('content-length');
        if (cl) res.setHeader('Content-Length', cl);

        upstream.body.pipeTo(new WritableStream({
            write(chunk) { res.write(chunk); },
            close() { res.end(); },
            abort(e) { if (!res.headersSent) res.destroy(e); },
        }));

        req.on('close', () => res.destroy());
    } catch (e) {
        if (!res.headersSent) res.status(500).json({ error: e.message });
    }
});

export default router;

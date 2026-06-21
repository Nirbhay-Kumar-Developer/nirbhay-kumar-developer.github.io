// assets/js/github.js
const GITHUB_PROFILE_USER = 'Nirbhay-Kumar-Developer';
const CLIENT_CACHE_LIMIT_MS = 900000; // 15 Minutes Cache window to safeguard rate limits

export async function queryProfileRepositories() {
    const dataKey = 'nk_gh_repos_dataset';
    const stampKey = 'nk_gh_repos_timestamp';
    
    const localCachedData = localStorage.getItem(dataKey);
    const localCachedStamp = localStorage.getItem(stampKey);

    if (localCachedData && localCachedStamp && (Date.now() - parseInt(localCachedStamp) < CLIENT_CACHE_LIMIT_MS)) {
        return JSON.parse(localCachedData);
    }

    try {
        const networkFetch = await fetch(`https://api.github.com/users/${GITHUB_PROFILE_USER}/repos?sort=updated&per_page=100`);
        if (!networkFetch.ok) throw new Error('GitHub network response rejection.');
        
        const rawResponse = await networkFetch.json();
        // Filter out structural forks to keep focus on native creations
        const originalRepos = rawResponse.filter(repo => !repo.fork);

        localStorage.setItem(dataKey, JSON.stringify(originalRepos));
        localStorage.setItem(stampKey, Date.now().toString());
        return originalRepos;
    } catch (apiError) {
        console.error('API Fetch Exception. Falling back to local device storage states:', apiError);
        return localCachedData ? JSON.parse(localCachedData) : [];
    }
}

export async function computeComplexLanguageMetrics() {
    const activeRepositories = await queryProfileRepositories();
    const metricsMap = {};
    let aggregatedByteVolume = 0;

    // Concurrently handle byte metrics queries from endpoint streams
    await Promise.all(activeRepositories.map(async (repoItem) => {
        try {
            const response = await fetch(repoItem.languages_url);
            if (!response.ok) return;
            const dataObject = await response.json();
            
            for (const [langName, bytesCount] of Object.entries(dataObject)) {
                metricsMap[langName] = (metricsMap[langName] || 0) + bytesCount;
                aggregatedByteVolume += bytesCount;
            }
        } catch (ignored) {}
    }));

    if (aggregatedByteVolume === 0) return [];

    return Object.entries(metricsMap).map(([name, bytes]) => ({
        name,
        percentage: parseFloat(((bytes / aggregatedByteVolume) * 100).toFixed(1))
    })).sort((a, b) => b.percentage - a.percentage);
}
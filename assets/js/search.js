export function executeVectorSearchQuery(collection, targetString) {
    if (!targetString.trim()) return [];
    
    const sanitizedSearchTerm = targetString.toLowerCase().trim();
    
    return collection.filter(dataNode => {
        const titleMatch = (dataNode.name || '').toLowerCase().includes(sanitizedSearchTerm);
        const descMatch = (dataNode.description || '').toLowerCase().includes(sanitizedSearchTerm);
        const tagsMatch = (dataNode.tags || []).some(tag => tag.toLowerCase().includes(sanitizedSearchTerm));
        const languageMatch = (dataNode.language || '').toLowerCase().includes(sanitizedSearchTerm);
        
        return titleMatch || descMatch || tagsMatch || languageMatch;
    });
}

export function highlightMatchedWordsMarkup(originalText, searchKeyword) {
    if (!searchKeyword.trim() || !originalText) return originalText;
    
    const tokenRegex = new RegExp(`(${searchKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    return originalText.replace(tokenRegex, `<mark style="background: var(--primary-glow); color: var(--primary); font-weight:700; border-radius:2px; padding:0 2px;">$1</mark>`);
}
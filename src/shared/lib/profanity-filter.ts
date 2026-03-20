/**
 * Simple utility to check for offensive words in Spanish.
 */
const restrictedWords = [
    'tonta', 'tonto', 'pendeja', 'pendejo', 'estupida', 'estupido',
    'zorra', 'zorro', 'puta', 'puto',
    'pendejada', 'pendejismo', 'carajo', 'odio', 'muérete', 'muerete',
    'idiota', 'baboso', 'babosa', 'imbecil', 'imbécil', 'estupidez',
    'mala clienta', 'vaya al carajo', 'vayase al carajo', 'te odio',
    'guey', 'matar', 'güey', 'mamon', 'mamona', 'pentonta', 'babas', 'gueyes'
];

export function hasProfanity(text: string): boolean {
    const normalizedText = text.toLowerCase();
    return restrictedWords.some(word => {
        // Use regex for word boundaries to avoid false positives with diminutives
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(normalizedText);
    });
}

export function getOffensiveWords(text: string): string[] {
    const normalizedText = text.toLowerCase();
    return restrictedWords.filter(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(normalizedText);
    });
}

/**
 * Simple utility to check for offensive words in Spanish.
 */
const restrictedWords = [
    'tonta', 'tonto', 'pendeja', 'pendejo', 'estupida', 'estupido',
    'perra', 'perro', 'zorra', 'zorro', 'puta', 'puto',
    'pendejada', 'pendejismo', 'carajo', 'odio', 'muérete', 'muerete',
    'idiota', 'baboso', 'babosa', 'imbecil', 'imbécil', 'estupidez',
    'mala clienta', 'vaya al carajo', 'vayase al carajo', 'te odio', 'eres una perra', 'es usted una perra',
    'guey', 'matar', 'güey', 'mamon', 'mamona', 'pentonta', 'babas', 'gueyes'
];

export function hasProfanity(text: string): boolean {
    const normalizedText = text.toLowerCase();
    return restrictedWords.some(word => {
        // Use a simple inclusion check or regex for word boundaries
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(normalizedText) || normalizedText.includes(word);
    });
}

export function getOffensiveWords(text: string): string[] {
    const normalizedText = text.toLowerCase();
    return restrictedWords.filter(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(normalizedText) || normalizedText.includes(word);
    });
}

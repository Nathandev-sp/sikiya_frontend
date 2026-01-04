/**
 * Formats a number for display (like YouTube style)
 * - Numbers up to 1000: displayed as-is (e.g., 999)
 * - Numbers 1000 and above: displayed with 'k' suffix (e.g., 1k, 2.5k, 10k)
 * 
 * @param {number} num - The number to format
 * @returns {string} - Formatted number string
 */
export const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    
    const number = typeof num === 'string' ? parseInt(num, 10) : num;
    
    if (isNaN(number)) return '0';
    if (number < 1000) return number.toString();
    
    // For numbers >= 1000, format as 'k'
    const thousands = number / 1000;
    // If it's a whole number (e.g., 2000 -> 2k), don't show decimals
    if (thousands % 1 === 0) {
        return `${thousands}k`;
    }
    // Otherwise, show one decimal place (e.g., 2500 -> 2.5k)
    return `${thousands.toFixed(1)}k`;
};

export default formatNumber;


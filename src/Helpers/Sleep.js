/**
 * Creates a delay for the specified amount of time
 * 
 * @param {number} [ms=300] - The delay time in milliseconds (default: 300ms)
 * @returns {Promise} A promise that resolves after the specified delay
 * 
 * @example
 * // Use with default delay (300ms)
 * import sleep from '../Helpers/Sleep';
 * 
 * const myFunction = async () => {
 *   console.log('Start');
 *   await sleep(); // Wait for default 300ms
 *   console.log('After default delay');
 * };
 * 
 * @example
 * // Use with custom delay
 * import sleep from '../Helpers/Sleep';
 * 
 * const myFunction = async () => {
 *   await sleep(500); // Wait for 500ms instead
 * };
 */
const sleep = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export default sleep;
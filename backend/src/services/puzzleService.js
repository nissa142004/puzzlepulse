const axios = require('axios');

/**
 * Service to handle interoperability with the external Heart API.
 * Demonstrates theme: Interoperability.
 */
class PuzzleService {
    constructor() {
        this.apiUrl = 'http://marcconrad.com/uob/heart/api.php?out=json';
    }

    async getRandomPuzzle() {
        try {
            const response = await axios.get(this.apiUrl);
            // The Heart API returns { question: URL, solution: NUMBER }
            return {
                questionImage: response.data.question,
                solution: response.data.solution
            };
        } catch (error) {
            console.error('Error fetching puzzle from Heart API:', error.message);
            throw new Error('Failed to fetch puzzle from external service');
        }
    }
}

module.exports = new PuzzleService();

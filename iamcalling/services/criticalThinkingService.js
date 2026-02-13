class CriticalThinkingService {
    constructor() {
        this.scenarios = new Map();
        this.userProgress = new Map();
    }

    // Core critical thinking categories
    getCategories() {
        return [
            { id: 'logical-reasoning', name: 'Logical Reasoning', description: 'Analyze arguments and identify logical fallacies' },
            { id: 'bias-detection', name: 'Bias Detection', description: 'Recognize cognitive biases in thinking' },
            { id: 'evidence-evaluation', name: 'Evidence Evaluation', description: 'Assess the quality and reliability of evidence' },
            { id: 'problem-solving', name: 'Problem Solving', description: 'Apply systematic approaches to complex problems' },
            { id: 'decision-making', name: 'Decision Making', description: 'Make informed decisions under uncertainty' }
        ];
    }

    // Generate analysis scenario
    createScenario(category, difficulty = 'medium') {
        const scenarios = {
            'logical-reasoning': [
                {
                    title: 'Argument Analysis',
                    description: 'Evaluate the logical structure of this argument and identify any fallacies.',
                    prompt: 'All successful people work hard. John works hard. Therefore, John is successful.',
                    correctAnswer: 'Affirming the consequent fallacy',
                    explanation: 'This commits the logical fallacy of affirming the consequent. Working hard is necessary but not sufficient for success.'
                }
            ],
            'bias-detection': [
                {
                    title: 'Confirmation Bias',
                    description: 'Identify the cognitive bias present in this scenario.',
                    prompt: 'Sarah only reads news sources that align with her ideological views and dismisses contradictory information.',
                    correctAnswer: 'Confirmation bias',
                    explanation: 'Sarah is exhibiting confirmation bias by seeking information that confirms her existing beliefs.'
                }
            ]
        };

        return scenarios[category]?.[0] || null;
    }

    // Evaluate user response
    evaluateResponse(scenarioId, userResponse) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) return null;

        const score = this.calculateScore(scenario.correctAnswer, userResponse);
        return {
            score,
            feedback: this.generateFeedback(scenario, userResponse, score),
            correctAnswer: scenario.correctAnswer,
            explanation: scenario.explanation
        };
    }

    calculateScore(correct, response) {
        // Simple similarity scoring
        const correctLower = correct.toLowerCase();
        const responseLower = response.toLowerCase();
        
        if (responseLower.includes(correctLower) || correctLower.includes(responseLower)) {
            return 100;
        }
        
        // Basic keyword matching
        const correctWords = correctLower.split(' ');
        const responseWords = responseLower.split(' ');
        const matches = correctWords.filter(word => responseWords.includes(word));
        
        return Math.round((matches.length / correctWords.length) * 100);
    }

    generateFeedback(scenario, response, score) {
        if (score >= 80) {
            return 'Excellent! You correctly identified the key concept.';
        } else if (score >= 60) {
            return 'Good effort! You\'re on the right track but consider the nuances.';
        } else {
            return 'This is a learning opportunity. Review the explanation and try again.';
        }
    }
}

export default CriticalThinkingService;

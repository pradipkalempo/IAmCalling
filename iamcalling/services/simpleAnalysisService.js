class SimpleAnalysisService {
    constructor() {
        this.scenarios = new Map();
        this.nextId = 1;
        this.initializeDefaultScenarios();
    }

    initializeDefaultScenarios() {
        const defaultScenarios = [
            {
                id: 1,
                title: 'Logical Fallacy Detection',
                category: 'logical-reasoning',
                difficulty: 'medium',
                description: 'Identify the logical fallacy in the argument',
                prompt: 'All successful people work hard. John works hard. Therefore, John is successful.',
                correctAnswer: 'Affirming the consequent',
                explanation: 'This commits the fallacy of affirming the consequent. Working hard is necessary but not sufficient for success.'
            },
            {
                id: 2,
                title: 'Confirmation Bias',
                category: 'bias-detection',
                difficulty: 'easy',
                description: 'Identify the cognitive bias',
                prompt: 'Sarah only reads news that confirms her beliefs and ignores contradictory evidence.',
                correctAnswer: 'Confirmation bias',
                explanation: 'Sarah exhibits confirmation bias by seeking only information that supports her existing views.'
            },
            {
                id: 3,
                title: 'Source Reliability',
                category: 'evidence-evaluation',
                difficulty: 'medium',
                description: 'Evaluate the credibility of this evidence',
                prompt: 'A study funded by a tobacco company claims smoking has no health risks.',
                correctAnswer: 'Unreliable due to conflict of interest',
                explanation: 'The funding source creates a clear conflict of interest, making the study unreliable.'
            }
        ];

        defaultScenarios.forEach(scenario => {
            this.scenarios.set(scenario.id, scenario);
        });
        this.nextId = defaultScenarios.length + 1;
    }

    async storeScenario(scenario) {
        scenario.id = scenario.id || this.nextId++;
        scenario.createdAt = new Date().toISOString();
        this.scenarios.set(scenario.id, scenario);
        return scenario;
    }

    async getDiverseScenarios(excludeIds = [], count = 3) {
        const categories = ['logical-reasoning', 'bias-detection', 'evidence-evaluation', 'problem-solving', 'decision-making'];
        const selected = [];
        const usedCategories = new Set();

        // Get scenarios by category
        for (const category of categories) {
            if (selected.length >= count) break;

            const categoryScenarios = Array.from(this.scenarios.values())
                .filter(s => s.category === category && !excludeIds.includes(s.id));

            if (categoryScenarios.length > 0) {
                const randomScenario = categoryScenarios[Math.floor(Math.random() * categoryScenarios.length)];
                selected.push(randomScenario);
                excludeIds.push(randomScenario.id);
                usedCategories.add(category);
            }
        }

        // Fill remaining slots
        while (selected.length < count) {
            const remaining = Array.from(this.scenarios.values())
                .filter(s => !excludeIds.includes(s.id));

            if (remaining.length === 0) break;

            const randomScenario = remaining[Math.floor(Math.random() * remaining.length)];
            selected.push(randomScenario);
            excludeIds.push(randomScenario.id);
        }

        return selected;
    }

    async getScenariosByCategory(category) {
        return Array.from(this.scenarios.values())
            .filter(s => s.category === category);
    }

    async getScenario(id) {
        return this.scenarios.get(id);
    }

    async testConnection() {
        return {
            connected: true,
            type: 'in-memory',
            scenarioCount: this.scenarios.size
        };
    }
}

export default SimpleAnalysisService;
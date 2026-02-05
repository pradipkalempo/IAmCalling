import express from 'express';
import CriticalThinkingService from '../services/criticalThinkingService.js';
import SimpleAnalysisService from '../services/simpleAnalysisService.js';

const router = express.Router();
const ctService = new CriticalThinkingService();
const analysisService = new SimpleAnalysisService();

// Get all critical thinking categories
router.get('/categories', (req, res) => {
    try {
        const categories = ctService.getCategories();
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get scenario by category and difficulty
router.get('/scenario/:category', (req, res) => {
    try {
        const { category } = req.params;
        const { difficulty = 'medium' } = req.query;
        
        const scenario = ctService.createScenario(category, difficulty);
        if (!scenario) {
            return res.status(404).json({ success: false, error: 'Scenario not found' });
        }
        
        res.json({ success: true, scenario });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit response for evaluation
router.post('/evaluate', (req, res) => {
    try {
        const { scenarioId, userResponse } = req.body;
        
        if (!scenarioId || !userResponse) {
            return res.status(400).json({ 
                success: false, 
                error: 'Scenario ID and user response are required' 
            });
        }
        
        const evaluation = ctService.evaluateResponse(scenarioId, userResponse);
        if (!evaluation) {
            return res.status(404).json({ success: false, error: 'Scenario not found' });
        }
        
        res.json({ success: true, evaluation });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user progress (placeholder for future implementation)
router.get('/progress/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        // Placeholder - implement user progress tracking
        res.json({ 
            success: true, 
            progress: {
                userId,
                completedScenarios: 0,
                averageScore: 0,
                categories: {}
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
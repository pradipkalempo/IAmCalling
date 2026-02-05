import { QdrantClient } from '@qdrant/js-client-rest';
import { supabase } from '../database/supabaseClient.js';

class UserSearchService {
    constructor() {
        this.client = new QdrantClient({
            url: process.env.QDRANT_URL || 'http://localhost:6333'
        });
        this.collectionName = 'user_search';
    }

    async initializeCollection() {
        try {
            await this.client.createCollection(this.collectionName, {
                vectors: { size: 384, distance: 'Cosine' }
            });
        } catch (error) {
            if (!error.message.includes('already exists')) {
                throw error;
            }
        }
    }

    async indexUser(user) {
        const vector = this.generateUserVector(user);
        await this.client.upsert(this.collectionName, {
            points: [{
                id: user.id,
                vector,
                payload: {
                    full_name: user.full_name,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    created_at: user.created_at,
                    last_active: user.last_active || user.created_at
                }
            }]
        });
    }

    async searchUsers(query, limit = 20) {
        if (!query || query.trim().length === 0) {
            return await this.getRecentUsers(limit);
        }

        const searchVector = this.generateSearchVector(query);
        const results = await this.client.search(this.collectionName, {
            vector: searchVector,
            limit,
            with_payload: true
        });

        return results.map(result => ({
            id: result.id,
            ...result.payload,
            score: result.score
        }));
    }

    async getRecentUsers(limit = 20) {
        const results = await this.client.scroll(this.collectionName, {
            limit,
            with_payload: true
        });

        return results.points
            .map(point => ({ id: point.id, ...point.payload }))
            .sort((a, b) => new Date(b.last_active) - new Date(a.last_active));
    }

    generateUserVector(user) {
        const vector = new Array(384).fill(0);
        const name = (user.full_name || '').toLowerCase();
        
        // Simple character-based encoding
        for (let i = 0; i < Math.min(name.length, 100); i++) {
            const charCode = name.charCodeAt(i);
            vector[i] = (charCode / 255) * 2 - 1;
        }
        
        // Add recency factor
        const daysSinceCreation = (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24);
        vector[200] = Math.max(0, 1 - daysSinceCreation / 365);
        
        return vector;
    }

    generateSearchVector(query) {
        const vector = new Array(384).fill(0);
        const normalizedQuery = query.toLowerCase();
        
        for (let i = 0; i < Math.min(normalizedQuery.length, 100); i++) {
            const charCode = normalizedQuery.charCodeAt(i);
            vector[i] = (charCode / 255) * 2 - 1;
        }
        
        return vector;
    }
}

export default UserSearchService;
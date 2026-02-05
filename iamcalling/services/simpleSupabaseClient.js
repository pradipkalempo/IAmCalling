class SimpleSupabaseClient {
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL || '';
        this.baseUrl = supabaseUrl ? `${supabaseUrl.replace(/\/+$/, '')}/rest/v1` : '';
        this.apiKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
    }
    
    getClient() {
        // Return a proper client object with the methods that the views route expects
        return {
            from: (table) => {
                return new QueryBuilder(this.baseUrl, this.apiKey, table);
            }
        };
    }
    
    from(table) {
        return new QueryBuilder(this.baseUrl, this.apiKey, table);
    }
}

class QueryBuilder {
    constructor(baseUrl, apiKey, table) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.table = table;
        this.selectFields = '*';
        this.filters = [];
        this.orderBy = null;
    }

    select(fields = '*') {
        this.selectFields = fields;
        return this;
    }

    eq(column, value) {
        this.filters.push(`${column}=eq.${value}`);
        return this;
    }

    order(column, options = {}) {
        const direction = options.ascending === false ? 'desc' : 'asc';
        this.orderBy = `${column}.${direction}`;
        return this;
    }

    async execute() {
        if (!this.baseUrl || !this.apiKey) {
            throw new Error('Supabase is not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_KEY.');
        }
        let url = `${this.baseUrl}/${this.table}?select=${this.selectFields}`;
        
        if (this.filters.length > 0) {
            url += '&' + this.filters.join('&');
        }
        
        if (this.orderBy) {
            url += `&order=${this.orderBy}`;
        }

        const response = await fetch(url, {
            headers: {
                'apikey': this.apiKey,
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return { data, error: null };
    }

    // Insert method for creating new records
    async insert(data) {
        const url = `${this.baseUrl}/${this.table}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': this.apiKey,
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(Array.isArray(data) ? data : [data])
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                return { data: null, error: { message: `HTTP ${response.status}: ${errorText}` } };
            }
            
            const result = await response.json();
            return { 
                data: Array.isArray(result) ? result[0] : result, 
                error: null 
            };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    }
    
    // Chain method to support .select() after .insert()
    select(fields = '*') {
        return {
            single: () => this.execute().then(result => ({
                ...result,
                data: Array.isArray(result.data) ? result.data[0] : result.data
            }))
        };
    }
    
    // Alias for execute to match Supabase API
    then(resolve, reject) {
        return this.execute().then(resolve, reject);
    }
}

export default SimpleSupabaseClient;

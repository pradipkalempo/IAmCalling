import app from './backend/app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`🚀 IAMCALLING Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Access: http://localhost:${PORT}`);
});

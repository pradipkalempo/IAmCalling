import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonFilePath = path.join(__dirname, '..', 'data', 'ideology_photos.json');

async function migratePhotos() {
    console.log('Starting photo data migration...');

    try {
        let photos;
        try {
            const data = await fs.readFile(jsonFilePath, 'utf8');
            photos = JSON.parse(data);
        } catch (readError) {
            if (readError.code === 'ENOENT') {
                console.log('JSON file not found. No migration needed.');
                return;
            }
            throw readError;
        }

        let changed = false;
        const migratedPhotos = photos.map(photo => {
            const newPhoto = { ...photo };
            let updated = false;

            // Check and add UUID if missing or not in UUID format
            if (!newPhoto.id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(newPhoto.id)) {
                newPhoto.id = uuidv4();
                updated = true;
            }

            // Check and add imageUrl if missing
            if (typeof newPhoto.imageUrl !== 'string' || newPhoto.imageUrl === '') {
                // Can't know the real image, so we'll use a placeholder path.
                // The user will need to re-upload or manually fix these.
                newPhoto.imageUrl = '/uploads/placeholder.png';
                updated = true;
            }

            if(updated) {
                changed = true;
            }
            return newPhoto;
        });

        if (changed) {
            await fs.writeFile(jsonFilePath, JSON.stringify(migratedPhotos, null, 2));
            console.log('Migration successful! `ideology_photos.json` has been updated with new IDs and placeholder image URLs.');
        } else {
            console.log('No migration needed. All photo entries are already up-to-date.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migratePhotos();
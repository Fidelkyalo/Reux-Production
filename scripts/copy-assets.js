
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = path.resolve(PROJECT_ROOT, '..'); // d:/REUX PRODUCTION
const DEST_ROOT = path.resolve(PROJECT_ROOT, 'public/assets');

const CATEGORIES_TO_SCAN = [
    'WEDDINGS',
    'NATURE',
    'STUDIO',
    'ENTERTEINMENT',
    'GRADUATION',
    'PROPOSAL',
    'RURACIO',
    'SHOOT',
    'WORK',
    'Open Air',
    'LIVE RECORDING'
];

// Helper to get random items
const getRandomItems = (arr, n) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
};

// Main function
const copyAssets = async () => {
    const manifest = {};
    if (!fs.existsSync(DEST_ROOT)) {
        fs.mkdirSync(DEST_ROOT, { recursive: true });
    }

    for (const category of CATEGORIES_TO_SCAN) {
        const sourceDir = path.join(SOURCE_ROOT, category);
        // Normalize destination directory name: lowercase and replace spaces with hyphens
        const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
        const destDir = path.join(DEST_ROOT, normalizedCategory);

        if (fs.existsSync(sourceDir)) {
            const files = fs.readdirSync(sourceDir);
            const images = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

            if (images.length > 0) {
                console.log(`Found ${images.length} images in ${category} -> ${normalizedCategory}`);

                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }

                // Copy ALL images
                images.forEach(image => {
                    const srcPath = path.join(sourceDir, image);
                    const destPath = path.join(destDir, image);
                    fs.copyFileSync(srcPath, destPath);
                });

                // Add ALL images to manifest using normalized paths
                manifest[category] = images.map(img => `/assets/${normalizedCategory}/${img}`);
            } else {
                console.log(`No images found in ${category}`);
                manifest[category] = [];
            }
        } else {
            console.log(`Category folder not found: ${category}`);
            manifest[category] = [];
        }
    }

    // Write manifest
    fs.writeFileSync(
        path.join(PROJECT_ROOT, 'src/assets-manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
    console.log('Asset copy complete & manifest generated!');
};

copyAssets();

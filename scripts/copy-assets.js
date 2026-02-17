
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

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

const BATCH_SIZE = 20; // Slightly smaller batch for processing
const MAX_DIMENSION = 1920;
const QUALITY = 80;

// Main function
const copyAssets = async () => {
    const manifest = {};
    if (!fs.existsSync(DEST_ROOT)) {
        fs.mkdirSync(DEST_ROOT, { recursive: true });
    }

    for (const category of CATEGORIES_TO_SCAN) {
        const sourceDir = path.join(SOURCE_ROOT, category);
        const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
        const destDir = path.join(DEST_ROOT, normalizedCategory);

        if (fs.existsSync(sourceDir)) {
            const files = fs.readdirSync(sourceDir);
            const images = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

            if (images.length > 0) {
                console.log(`Optimizing ${images.length} images in ${category} -> ${normalizedCategory}`);

                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }

                // Process images in batches
                for (let i = 0; i < images.length; i += BATCH_SIZE) {
                    const batch = images.slice(i, i + BATCH_SIZE);
                    console.log(`  Processing batch ${i / BATCH_SIZE + 1}/${Math.ceil(images.length / BATCH_SIZE)}...`);

                    const processPromises = batch.map(async (image) => {
                        const srcPath = path.join(sourceDir, image);
                        const fileName = path.parse(image).name + '.webp';
                        const destPath = path.join(destDir, fileName);

                        try {
                            // Resize and compress
                            await sharp(srcPath)
                                .resize(MAX_DIMENSION, MAX_DIMENSION, {
                                    fit: 'inside',
                                    withoutEnlargement: true
                                })
                                .webp({ quality: QUALITY })
                                .toFile(destPath);
                        } catch (err) {
                            console.error(`    Failed to process ${image}: ${err.message}`);
                            // Fallback to simple copy if sharp fails
                            try {
                                fs.copyFileSync(srcPath, destPath);
                            } catch (copyErr) {
                                console.error(`    Fallback copy also failed for ${image}: ${copyErr.message}`);
                            }
                        }
                    });

                    await Promise.all(processPromises);
                }

                // Add ALL images to manifest (with updated .webp extension)
                manifest[category] = images.map(img => `/assets/${normalizedCategory}/${path.parse(img).name}.webp`);
                console.log(`Successfully processed ${category}`);
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
    console.log('Asset optimization complete & manifest generated!');
};

copyAssets();

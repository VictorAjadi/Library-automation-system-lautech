const Media = require("../models/Media");
const fs = require('fs').promises;
const path = require('path');

exports.imgCleanUp = async (req, query = null, mediaId = null) => {
    if (query) {
        if (req.files?.[`${query}`]?.[0]) {
            const filePath = path.join(__dirname, '..', req.files[`${query}`][0].path.replace(/\\/g, '/'));
            await fs.unlink(filePath); // Delete the file

            // If mediaId is provided, delete the media document
            if (mediaId) {
                const media = await Media.findById(mediaId);
                if (media) {
                    await media.deleteOne();
                }
            }
        }
    } else {
        // Handle case where there is no query but files exist
        if (req.files && Object.keys(req.files).length > 0) {
            // Delete all files in req.files and corresponding media documents
            for (const fileGroup in req.files) {
                for (const file of req.files[fileGroup]) {
                    const filePath = path.join(__dirname, '..', file.path.replace(/\\/g, '/'));
                    await fs.unlink(filePath); // Delete the file

                    // Attempt to find and delete the media document that matches the file path
                    const media = await Media.findOne({ path: file.path.replace(/\\/g, '/') });
                    if (media) {
                        await media.deleteOne(); // Delete the media document
                    }
                }
            }
        }

        // Handle single file upload
        if (req.file) {
            const filePath = path.join(__dirname, '..', req.file.path.replace(/\\/g, '/'));
            await fs.unlink(filePath); // Delete the file

            // Attempt to find and delete the media document that matches the file path
            const media = await Media.findOne({ path: req.file.path.replace(/\\/g, '/') });
            if (media) {
                await media.deleteOne(); // Delete the media document
            }
        }
    }
};

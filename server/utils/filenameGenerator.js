const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import the UUID v4 generator

exports.generateFilename = (_, file, cb) => {
    const uniqueId = uuidv4(); // Generate a unique identifier
    const ext = path.extname(file.originalname); // Get the file extension
    cb(null, `${file.fieldname}-${uniqueId}${ext}`); // Generate unique filename
};

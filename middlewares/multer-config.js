const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};



const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        console.log(`source : ${file.fieldname}`);
        console.log(`name : ${file.originalname}`);
        fieldname = file.fieldname;
        callback(null, `images/${file.originalname.split('_')[0]}`);
        
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_').split('.')[0];
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + "_" + Date.now() + '.' + extension);
    }
});

module.exports = multer({storage: storage}).single('file');
//file.fieldname contient le nom du champ de saisie, mais inaccessible ici
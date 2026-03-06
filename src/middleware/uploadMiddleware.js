import multer from 'multer';

const MAX_AVATAR_SIZE = 20 * 1024 * 1024; // 20MB

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        cb(new Error('Only image files are allowed'));
        return;
    }

    cb(null, true);
};

const avatarUpload = multer({
    storage,
    limits: {
        fileSize: MAX_AVATAR_SIZE
    },
    fileFilter: imageFileFilter
});

export {
    avatarUpload,
    MAX_AVATAR_SIZE
};

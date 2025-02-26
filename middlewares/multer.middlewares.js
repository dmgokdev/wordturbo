import multer from 'multer';
import { ulid } from 'ulid';

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'temp_uploads/');
	},
	filename: (req, file, cb) => {
		cb(null, `${ulid()}.${file.originalname.split('.').pop()}`);
	},
});

export const upload = multer({
	storage,
	fileFilter: (_req, file, cb) => {
		const [fileType, _fileSubtype] = file.mimetype.split('/');

		if (fileType === 'image') {
			cb(null, true);
		} else {
			// cb(new Error('File format not supported'), false);
		}
	},
});

import { v2 as cloudinary } from 'cloudinary';
import { ulid } from 'ulid';

import {
	CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET,
	CLOUDINARY_CLOUD_NAME,
} from '../config';

cloudinary.config({
	cloud_name: CLOUDINARY_CLOUD_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
	timeout: 3600000, // 60 minutes
	secure: false,
});

export const uploadToCloudinary = async (file, folder) => {
	const id = ulid();
	return cloudinary.uploader.upload(file.path, {
		resource_type: 'image',
		public_id: id,
		folder,
	});
};

export const deleteFromCloudinary = async resources => {
	if (Array.isArray(resources)) {
		const promises = resources.map(async ({ id, type }) => {
			return cloudinary.uploader.destroy(id, { resource_type: type });
		});
		return Promise.all(promises);
	}
	return cloudinary.uploader.destroy(resources.id, {
		resource_type: resources.type,
	});
};

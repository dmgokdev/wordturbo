export const INVALID_DONATION_ID = 'Invalid Donation ID';
export const DONATION_NOT_FOUND = 'Donation Not Found';
export const GET_DONATION_SUCCESS = 'Donations fetched successfully';
export const DONATION_ALREADY_EXIST = 'Donation already exist';
export const DONATION_CREATED_SUCCESS = 'Donation created successfully';
export const DONATION_UPDATED_SUCCESS = 'Donation updated successfully';
export const DONATION_DELETED_SUCCESS = 'Donation deleted successfully';
export const PAYMENT_CONFIRMED_SUCCESS = 'Payment confirmed successfully';

export const DONATION_STATUS = {
	PENDING: 'PENDING',
	PROCESSING: 'PROCESSING',
	INPROGRESS: 'IN-PROGRESS',
	FAILED: 'FAILED',
	COMPLETED: 'COMPLETED',
	CANCELLED: 'CANCELLED',
};

export const ALLOWED_DONATION_SORT_OPTIONS = [
	'id',
	'name',
	'description',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_DONATION_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_DONATION_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_DONATION_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'description',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_DONATION_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_DONATION_SORT_OPTIONS.includes(field);
				const isValidDirection = ALLOWED_SORT_DIRECTION.includes(direction);
				return isValidField && isValidDirection;
			},
		},
	},
	{
		propertyName: 'page',
		type: 'number',
		min: 1,
	},
	{
		propertyName: 'limit',
		type: 'number',
		min: 1,
	},
];

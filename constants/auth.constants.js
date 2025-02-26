export const SOMETHING_WENT_WRONG = 'Something went wrong';
export const USER_NOT_FOUND = 'User not found';
export const REQUIRED_FIELDS = 'Missing required field';
export const INVALID_CREDENTIALS = 'Invalid credentials';
export const NOT_ALLOWED_TO_LOGIN = 'You are not allowed to login here';
export const INVALID_ACCESS_TOKEN = 'Invalid access token';
export const NOT_ENOUGH_RIGHTS = 'Not enough rights';
export const UNAUTHORIZED = 'Unauthorized';
export const OTP_NOT_VERIFIED = 'OTP is not correct';
export const OTP_VERIFIED = 'OTP matched successfully';
export const OTP_SEND_SUCCESS = 'OTP sended successfully';
export const LOGIN_SUCCESS = 'Login success';
export const REGISTER_SUCCESS = 'Register success';
export const RESET_SUCCESS = 'Password Reset Successful';
export const INVALID_EMAIL = 'Invalid Email Address';
export const EMAIL_EXISTS = 'Email already exists';
export const PASSWORD_MIN_LENGTH = 'Password must be at least 6 characters';
export const INTEGER_ERROR = 'Value must be at an integer';
export const INVALID_TOKEN = 'Invalid Token';
export const INVALID_DATE_FORMAT = 'Invalid date format';
export const INVALID_GENDER = 'Invalid gender value';
export const INVALID_ROLE = 'Role Not Found';
export const INVALID_STATUS = 'Status Not Found';
export const GET_USERS_SUCCESS = 'User/s fetched successfully';
export const USER_CREATED_SUCCESS = 'User created successfully';
export const USER_UPDATED_SUCCESS = 'User updated successfully';
export const USER_DELETED_SUCCESS = 'User deleted successfully';

export const ACCOUNT_STATUS = {
	ACTIVE: 'ACTIVE',
	INACTIVE: 'INACTIVE',
	BLOCKED: 'BLOCKED',
	PENDING: 'PENDING',
	SHOULD_CHANGE_PASSWORD: 'SHOULD_CHANGE_PASSWORD',
};
export const ALL_STATUS = [
	'ACTIVE',
	'INACTIVE',
	'BLOCKED',
	'PENDING',
	'SHOULD_CHANGE_PASSWORD',
];

export const USER_ROLES = {
	ADMIN: 'ADMIN',
	BRAND: 'BRAND',
	CUSTOMER: 'CUSTOMER',
};
export const ALL_ROLES = ['ADMIN', 'BRAND', 'CUSTOMER'];

export const GENDERS = ['F', 'M', 'O'];

export const ALLOWED_USER_SORT_OPTIONS = [
	'id',
	'name',
	'email',
	'status',
	'created_at',
	'updated_at',
];

export const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_USER_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_USER_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_USER_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'email',
		type: 'string',
	},
	{
		propertyName: 'status',
		type: 'string',
		transform: value => value.toUpperCase(),
	},
	{
		propertyName: 'gender',
		type: 'string',
		transform: value => value.toUpperCase(),
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_USER_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_USER_SORT_OPTIONS.includes(field);
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

export const INVALID_ROLE_ID = 'Invalid Role ID';
export const ROLE_NOT_FOUND = 'Role Not Found';
export const GET_ROLE_SUCCESS = 'Roles fetched successfully';
export const ROLE_ALREADY_EXIST = 'Role already exist';
export const ROLE_CREATED_SUCCESS = 'Role created successfully';
export const ROLE_UPDATED_SUCCESS = 'Role updated successfully';
export const ROLE_DELETED_SUCCESS = 'Role deleted successfully';

export const ALLOWED_ROLE_SORT_OPTIONS = [
	'id',
	'name',
	'description',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_ROLE_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_ROLE_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_ROLE_QUERY_SCHEMA_CONFIG = [
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
			message: INVALID_ROLE_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_ROLE_SORT_OPTIONS.includes(field);
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

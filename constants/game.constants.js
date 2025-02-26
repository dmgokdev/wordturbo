export const INVALID_GAME_ID = 'Invalid Game ID';
export const GAME_NOT_FOUND = 'Game Not Found';
export const GAME_ALREADY_STARTED = 'Game already started';
export const GAME_STARTED_SUCCESS = 'Game started successfully';
export const GET_GAME_SUCCESS = 'Games fetched successfully';
export const GAME_RESIGN_SUCCESS =
	'You have resigned from the game. Thanks for playing!';
export const GAME_ALREADY_EXIST = 'Game already exist';
export const GAME_CREATED_SUCCESS = 'Game created successfully';
export const GAME_UPDATED_SUCCESS = 'Game updated successfully';
export const GAME_DELETED_SUCCESS = 'Game deleted successfully';

export const ALLOWED_GAME_SORT_OPTIONS = [
	'id',
	'start_time',
	'end_time',
	'status',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_GAME_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_GAME_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_GAME_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'start_time',
		type: 'string',
	},
	{
		propertyName: 'end_time',
		type: 'string',
	},
	{
		propertyName: 'status',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_GAME_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_GAME_SORT_OPTIONS.includes(field);
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

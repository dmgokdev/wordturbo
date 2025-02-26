export const INVALID_PLAYER_ID = 'Invalid Player ID';
export const PLAYER_NOT_FOUND = 'Player Not Found';
export const GET_PLAYER_SUCCESS = 'Players fetched successfully';
export const PLAYER_ALREADY_EXIST = 'Player already exist';
export const PLAYER_CREATED_SUCCESS = 'Player created successfully';
export const PLAYER_UPDATED_SUCCESS = 'Player updated successfully';
export const PLAYER_DELETED_SUCCESS = 'Player deleted successfully';

export const ALLOWED_PLAYER_SORT_OPTIONS = [
	'id',
	'user_id',
	'room_id',
	'game_id',
	'score',
	'position',
	'joined_at',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_PLAYER_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_PLAYER_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_PLAYER_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'user_id',
		type: 'number',
	},
	{
		propertyName: 'room_id',
		type: 'number',
	},
	{
		propertyName: 'game_id',
		type: 'number',
	},
	{
		propertyName: 'score',
		type: 'number',
	},
	{
		propertyName: 'position',
		type: 'number',
	},
	{
		propertyName: 'found_word',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_PLAYER_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_PLAYER_SORT_OPTIONS.includes(field);
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

export const ROOM_NOT_FOUND = 'Room Not Found';
export const INVALID_ROOM_ID = 'Invalid Room ID';
export const ROOM_ALREADY_EXIST = 'Room already exist';
export const GET_ROOM_SUCCESS = 'Rooms fetched successfully';
export const ROOM_CREATED_SUCCESS = 'Room created successfully';
export const ROOM_UPDATED_SUCCESS = 'Room updated successfully';
export const ROOM_DELETED_SUCCESS = 'Room deleted successfully';
export const INVALID_ROOM_CODE = 'Invalid Room Code or Room is Full';
export const ROOM_RESIGN_SUCCESS =
	'You have resigned from the game. Thanks for playing!';

export const ALLOWED_ROOM_SORT_OPTIONS = [
	'id',
	'game_id',
	'room_code',
	'is_full',
	'created_by',
	'status',
	'type',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_ROOM_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_ROOM_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_ROOM_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'game_id',
		type: 'number',
	},
	{
		propertyName: 'room_code',
		type: 'string',
	},
	{
		propertyName: 'is_full',
		type: 'string',
	},
	{
		propertyName: 'created_by',
		type: 'number',
	},
	{
		propertyName: 'status',
		type: 'string',
	},
	{
		propertyName: 'type',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_ROOM_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_ROOM_SORT_OPTIONS.includes(field);
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

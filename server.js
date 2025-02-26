import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import responseTime from 'response-time';

import { PORT, SOCKET_PORT } from './config';
import {
	notFound,
	errorMiddleware,
	// rateLimiter
} from './middlewares';
import {
	AuthRoutes,
	RoleRoutes,
	RoomRoutes,
	GameRoutes,
	PlayerRoutes,
	DonationRoutes,
	CustomerRoutes,
	StatsRoutes,
} from './routes';
import { initSocket } from './utils/socket.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const server = http.createServer(app);
initSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(rateLimiter);
app.use(compression());
app.use(morgan('dev'));
app.use(responseTime());

app.use(cors({ origin: '*' }));

app.use('/public', express.static(path.join(path.resolve(), 'temp_uploads')));
app.use(express.static(path.join(path.resolve(), 'public')));

app.use(helmet());

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/customer', CustomerRoutes);
app.use('/api/v1/donation', DonationRoutes);
app.use('/api/v1/game', GameRoutes);
app.use('/api/v1/player', PlayerRoutes);
app.use('/api/v1/role', RoleRoutes);
app.use('/api/v1/room', RoomRoutes);
app.use('/api/v1/stats', StatsRoutes);

app.get('/home', (req, res) => {
	res.status(200).json({ data: 'Server is running' });
});

// app.get('/foldertest', (req, res) => {
// 	const crudName = 'room';
// 	const replacements = ['Room','ROOM','room','.rooms.'];
// 	const folders = ['constants', 'controllers', 'routes', 'validations', 'services'];

// 	folders.forEach((folder) => {
// 	    const sourceFilePath = path.join(__dirname, folder, `role.${folder}.js`);
// 	    const destinationFileName = `${crudName}.${folder}.js`;
// 	    const destinationFilePath = path.join(__dirname, folder, destinationFileName);
// 	    const indexFilePath = path.join(__dirname, folder, 'index.js');

// 	    fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
// 	        if (err) {
// 	            console.error(`Error copying file in ${folder}:`, err);
// 	        } else {
// 	            console.log(`File copied in ${folder} as ${destinationFileName}`);

// 	            fs.readFile(destinationFilePath, 'utf8', (readErr, data) => {
// 	                if (readErr) {
// 	                    console.error(`Error reading file in ${folder}:`, readErr);
// 	                } else {
// 	                    const updatedContent = data
// 	                        .replace(/Role/g, replacements[0])
// 	                        .replace(/ROLE/g, replacements[1])
// 	                        .replace(/role/g, replacements[2])
// 							.replace(/\.roles\./g, replacements[3]);

// 	                    fs.writeFile(destinationFilePath, updatedContent, 'utf8', (writeErr) => {
// 	                        if (writeErr) {
// 	                            console.error(`Error writing file in ${folder}:`, writeErr);
// 	                        } else {
// 	                            console.log(`File updated in ${folder} with replacements`);

// 	                            const exportLine = `export * from './${crudName}.${folder}';\n`;
// 	                            fs.appendFile(indexFilePath, exportLine, (appendErr) => {
// 	                                if (appendErr) {
// 	                                    console.error(`Error appending to index.js in ${folder}:`, appendErr);
// 	                                } else {
// 	                                    console.log(`Export line added to index.js in ${folder}`);
// 	                                }
// 	                            });
// 	                        }
// 	                    });
// 	                }
// 	            });
// 	        }
// 	    });
// 	});

// 	res.status(200).json({ data: 'Files copied, updated, and export line added successfully' });
// });

app.use('*', notFound);
app.use(errorMiddleware);

if (!fs.existsSync('./temp_uploads')) {
	fs.mkdirSync('./temp_uploads', { recursive: true });
	// eslint-disable-next-line no-console
	console.log('temp_uploads folder created!');
}

app.listen(PORT || 3000, () => {
	// eslint-disable-next-line no-console
	console.log(`Server is listening at port ${PORT}`);
});

server.listen(SOCKET_PORT || 4000, () => {
	// eslint-disable-next-line no-console
	console.log(`Socket Server is listening at port ${SOCKET_PORT}`);
});

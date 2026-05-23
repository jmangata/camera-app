"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const auth_1 = __importDefault(require("./routes/auth"));
const cameras_1 = __importDefault(require("./routes/cameras"));
const categories_1 = __importDefault(require("./routes/categories"));
const reports_1 = __importDefault(require("./routes/reports"));
const admin_1 = __importDefault(require("./routes/admin"));
const comments_1 = __importDefault(require("./routes/comments"));
const favorites_1 = __importDefault(require("./routes/favorites"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests, please try again later',
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_1.default);
app.use('/api/cameras', cameras_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api', comments_1.default);
app.use('/api', favorites_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
exports.io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join-camera', (cameraId) => {
        socket.join(`camera-${cameraId}`);
    });
    socket.on('leave-camera', (cameraId) => {
        socket.leave(`camera-${cameraId}`);
    });
    socket.on('new-camera', (camera) => {
        exports.io.emit('camera-added', camera);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
//# sourceMappingURL=index.js.map
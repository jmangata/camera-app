"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticateToken = void 0;
const auth_1 = require("../lib/auth");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token requis' });
    }
    try {
        const user = auth_1.AuthService.verifyToken(token);
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Token invalide' });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentification requise' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Permissions insuffisantes' });
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.js.map
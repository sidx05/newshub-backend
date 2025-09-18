"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
const express_1 = require("express");
const public_routes_1 = __importDefault(require("./public.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
function setupRoutes(app) {
    // Root redirect to API docs
    app.get('/', (req, res) => {
        res.send('Welcome to NewsHub Backend!');
    });
    // Create the API router
    const apiRouter = (0, express_1.Router)();
    // Mount other routers to the API router
    apiRouter.use('/public', public_routes_1.default);
    apiRouter.use('/auth', auth_routes_1.default);
    apiRouter.use('/admin', admin_routes_1.default);
    // Mount API router to the app
    app.use('/api', apiRouter);
}
//# sourceMappingURL=index.js.map
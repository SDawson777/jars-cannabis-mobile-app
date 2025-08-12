"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Cast to any to allow access to models not yet defined in the generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.prisma = new client_1.PrismaClient();

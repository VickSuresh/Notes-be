import http, { Server } from "http";
import app from "./app";

const server: Server = http.createServer(app);

const PORT = process.env.PORT;
const port: string | number = PORT || 8080;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
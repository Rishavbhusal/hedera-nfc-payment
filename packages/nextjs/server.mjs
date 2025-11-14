import fs from "fs";
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import next from "next";
import os from "os";
import path from "path";
import { parse } from "url";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== "production";
// Use 0.0.0.0 to allow access from mobile devices on the same network
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

// Check for mkcert certificates (relative to server.mjs location)
const certsDir = path.join(__dirname, "certs");

// Find certificate files (mkcert generates localhost+N.pem based on number of domains)
let certPath = null;
let keyPath = null;

if (fs.existsSync(certsDir)) {
  const files = fs.readdirSync(certsDir);
  const certFile = files.find(f => f.startsWith("localhost+") && f.endsWith(".pem") && !f.includes("-key"));
  const keyFile = files.find(f => f.startsWith("localhost+") && f.endsWith("-key.pem"));

  if (certFile && keyFile) {
    certPath = path.join(certsDir, certFile);
    keyPath = path.join(certsDir, keyFile);
  }
}

const hasCerts = certPath && keyPath && fs.existsSync(certPath) && fs.existsSync(keyPath);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const requestHandler = async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  };

  const server = hasCerts
    ? createHttpsServer(
        {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        },
        requestHandler,
      )
    : createHttpServer(requestHandler);

  server.listen(port, hostname, err => {
    if (err) throw err;
    const protocol = hasCerts ? "https" : "http";
    const machineHostname = os.hostname();
    const localHostname = machineHostname.endsWith(".local") ? machineHostname : `${machineHostname}.local`;

    // Get local network IP address for mobile access
    const networkInterfaces = os.networkInterfaces();
    let localIP = "localhost";
    for (const interfaceName of Object.keys(networkInterfaces)) {
      const addresses = networkInterfaces[interfaceName];
      for (const addr of addresses || []) {
        // Handle both string and number family formats
        const isIPv4 = addr.family === "IPv4" || addr.family === 4;
        if (isIPv4 && !addr.internal) {
          localIP = addr.address;
          break;
        }
      }
      if (localIP !== "localhost") break;
    }

    console.log(`> Ready on ${protocol}://localhost:${port}`);
    console.log(`> Also available at ${protocol}://${localHostname}:${port}`);
    console.log(`> 📱 Mobile access: ${protocol}://${localIP}:${port}`);
    console.log(`> Make sure your mobile device is on the same WiFi network`);

    if (!hasCerts) {
      console.log("> ⚠️  Running in HTTP mode. Web NFC requires HTTPS!");
      console.log("> To enable HTTPS, run:");
      console.log(`>   cd ${__dirname} && ./setup-https.sh`);
      console.log("> Or manually:");
      console.log(">   1. Install mkcert: https://github.com/FiloSottile/mkcert");
      console.log(">   2. Setup CA: mkcert -install");
      console.log(`>   3. Generate certs: cd ${certsDir} && mkcert localhost 127.0.0.1 ::1 ${localIP}`);
    }
  });
});

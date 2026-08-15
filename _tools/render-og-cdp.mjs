import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function findChromePath() {
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
  const msPlaywrightDir = path.join(localAppData, "ms-playwright");
  if (fs.existsSync(msPlaywrightDir)) {
    const entries = fs.readdirSync(msPlaywrightDir);
    const chromiumEntry = entries.find((e) => e.startsWith("chromium-"));
    if (chromiumEntry) {
      const candidate = path.join(msPlaywrightDir, chromiumEntry, "chrome-win64", "chrome.exe");
      if (fs.existsSync(candidate)) return candidate;
      const candidate2 = path.join(msPlaywrightDir, chromiumEntry, "chrome-win", "chrome.exe");
      if (fs.existsSync(candidate2)) return candidate2;
    }
  }
  return "chrome";
}

const chromePath = findChromePath();
const htmlPath = path.join(rootDir, "_tools", "og-image.html");
const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;

async function main() {
  console.log("Launching Chromium with Remote Debugging...");
  const chromeProcess = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--remote-debugging-port=9222",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    "--window-size=1200,630",
    "about:blank",
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const res = await fetch("http://127.0.0.1:9222/json/version");
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    chromeProcess.kill();
    throw new Error("Failed to connect to Chrome CDP endpoint");
  }

  console.log("Connected to Chrome CDP WebSocket:", wsUrl);
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve) => ws.addEventListener("open", resolve));

  let msgId = 1;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = msgId++;
      const listener = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener("message", listener);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener("message", listener);
      ws.send(JSON.stringify({ id, method, params }));
    });

  const { targetId } = await send("Target.createTarget", { url: fileUrl });
  const targets = await (await fetch("http://127.0.0.1:9222/json/list")).json();
  const targetObj = targets.find((t) => t.id === targetId);
  const targetWsUrl = targetObj.webSocketDebuggerUrl;

  const targetWs = new WebSocket(targetWsUrl);
  await new Promise((resolve) => targetWs.addEventListener("open", resolve));

  const sendTarget = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = msgId++;
      const listener = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          targetWs.removeEventListener("message", listener);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      targetWs.addEventListener("message", listener);
      targetWs.send(JSON.stringify({ id, method, params }));
    });

  await sendTarget("Page.enable");
  await sendTarget("Emulation.setDeviceMetricsOverride", {
    width: 1200,
    height: 630,
    deviceScaleFactor: 2,
    mobile: false,
  });

  console.log("Navigating to OG template...");
  await sendTarget("Page.navigate", { url: fileUrl });

  // Wait 1.5s for fonts and styles to render
  await new Promise((r) => setTimeout(r, 1500));
  await sendTarget("Runtime.evaluate", { expression: "document.fonts.ready" });

  console.log("Capturing 2x screenshot via CDP...");
  const screenshot = await sendTarget("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 },
  });

  targetWs.close();
  ws.close();
  chromeProcess.kill();

  const buffer = Buffer.from(screenshot.data, "base64");
  const rawPngPath = path.join(rootDir, "_tools", "raw-2x.png");
  fs.writeFileSync(rawPngPath, buffer);
  console.log("Raw 2x screenshot saved:", rawPngPath, "bytes:", buffer.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

const fs = require('fs');

async function testVite() {
  const { createServer } = require('vite');
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  
  try {
    const module = await server.ssrLoadModule('/src/main.tsx');
    console.log("Module loaded successfully!");
  } catch (e) {
    console.error("Vite runtime error:", e);
  }
  
  await server.close();
}

testVite();

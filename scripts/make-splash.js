const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets', 'splash');
fs.mkdirSync(dir, { recursive: true });
// 1x1 white PNG (base64)
const b64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottQAAAABJRU5ErkJggg==';
fs.writeFileSync(path.join(dir, 'jars_splash_static.png'), Buffer.from(b64, 'base64'));
if (process.env.DEBUG === 'true') {
  console.debug('✓ wrote assets/splash/jars_splash_static.png');
}

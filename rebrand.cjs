const fs = require('fs');
const path = 'src/routes/mercadopromo.tsx';
let c = fs.readFileSync(path, 'utf8');

// Replace colors
c = c.replace(/#3483fa/g, '#79C142');
c = c.replace(/#e6f0ff/g, '#f2fbe8');
c = c.replace(/#2968c8/g, '#6bb136');
c = c.replace(/#d5e4fc/g, '#e5f7d3');
c = c.replace(/bg-\[\#fff159\]/g, 'bg-white border-b border-gray-200');

// Replace Logo
c = c.replace(/import mlLogo from "\@\/assets\/mercadopromo\/ml-logo.png";/g, 'const logoUrl = "/logo.webp";');
c = c.replace(/mlLogo/g, 'logoUrl');

// Add borders to the search bar since background is now white
c = c.replace(/shadow-sm focus:outline-none/g, 'border border-gray-300 shadow-sm focus:outline-none');

fs.writeFileSync(path, c);
console.log('Rebrand complete.');

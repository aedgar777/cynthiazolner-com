const fs = require('fs');
const path = require('path');

// Read the template file
const configTemplate = fs.readFileSync(
    path.join(__dirname, '../public/js/config.template.js'),
    'utf8'
);

// Replace placeholders with environment variables
const config = configTemplate
    .replace('__EMAILJS_PUBLIC_KEY__', process.env.EMAILJS_PUBLIC_KEY)
    .replace('__EMAILJS_SERVICE_ID__', process.env.EMAILJS_SERVICE_ID)
    .replace('__EMAILJS_TEMPLATE_ID__', process.env.EMAILJS_TEMPLATE_ID);

// Write the config file
fs.writeFileSync(
    path.join(__dirname, '../public/js/config.js'),
    config
);

console.log('Config file generated successfully!');
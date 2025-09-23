import fs from 'node:fs';
import path from 'node:path';
import { convert } from 'openapi-to-postmanv2';

const specPath = path.join(process.cwd(), 'backend/openapi.yaml');
const outputDir = path.join(process.cwd(), 'dist/postman');

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true });

try {
  const spec = fs.readFileSync(specPath, 'utf-8');

  convert(
    { type: 'string', data: spec },
    { folderStrategy: 'Tags', includeAuthInfoInExample: true },
    (err, conversionResult) => {
      if (err || !conversionResult?.result) {
        console.error('Conversion failed:', err || conversionResult);
        process.exit(1);
      }

      const outputPath = path.join(outputDir, 'jars.postman.json');
      fs.writeFileSync(outputPath, JSON.stringify(conversionResult.output[0].data, null, 2));

      console.log(`✅ Exported Postman collection to ${outputPath}`);
      console.log(
        `📁 Collection contains ${conversionResult.output[0].data.item?.length || 0} request groups`
      );
    }
  );
} catch (error) {
  console.error('Error reading OpenAPI spec:', error);
  process.exit(1);
}

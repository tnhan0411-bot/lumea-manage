const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const visaRegex = /\s*<Card>\n\s*<CardHeader title="Theo d.i Visa \(Stamp\)" \/>[\s\S]*?<\/Card>/;
const visaMatch = code.match(visaRegex);

if (visaMatch) {
  code = code.replace(visaRegex, '');
  
  const chartEndRegex = /<\/BarChart>\n\s*<\/ResponsiveContainer>\n\s*<\/CardContent>\n\s*<\/Card>/;
  code = code.replace(chartEndRegex, `</BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
${visaMatch[0]}`);
  
  fs.writeFileSync('src/components/Dashboard.tsx', code);
  console.log('Moved Visa block');
} else {
  console.log('Visa block not found');
}

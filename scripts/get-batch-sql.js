#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const dir = "/Users/monirghailan/Project_BlueLightningServices/.index-batches";
const idx = parseInt(process.argv[2] || '0', 10);
const batches = fs.readdirSync(dir).filter(f => /^genie-small-\d+\.sql$/.test(f)).sort();
if (idx >= batches.length) { console.log('DONE'); process.exit(0); }
const file = batches[idx];
const sql = fs.readFileSync(path.join(dir, file), 'utf8');
process.stdout.write(JSON.stringify({ idx, file, sql }));

#!/usr/bin/env python3
"""Offline sanity checks for a BlaZe source checkout; no credentials are read."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
required = [
    ROOT / 'index.js',
    ROOT / 'src' / 'blaze.js',
    ROOT / 'src' / 'config.js',
    ROOT / 'package.json',
    ROOT / 'README.md',
    ROOT / '.github' / 'workflows' / 'ci.yml',
]
missing = [str(path.relative_to(ROOT)) for path in required if not path.is_file()]
if missing:
    print('Missing required files:', ', '.join(missing))
    sys.exit(1)

package = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))
if package.get('name') != 'blaze-discord-bot':
    print('Unexpected package name:', package.get('name'))
    sys.exit(1)
if package.get('license') != 'MIT':
    print('package.json license must match the included MIT license.')
    sys.exit(1)

example = (ROOT / '.env.example').read_text(encoding='utf-8')
required_keys = ('DISCORD_TOKEN=', 'DISCORD_CLIENT_ID=', 'BOT_PREFIX=', 'MONGO_URI=', 'LAVALINK_URL=', 'LAVALINK_PASSWORD=')
missing_keys = [key[:-1] for key in required_keys if key not in example]
if missing_keys:
    print('Missing environment template keys:', ', '.join(missing_keys))
    sys.exit(1)

if not (ROOT / '.gitignore').exists():
    print('Missing .gitignore')
    sys.exit(1)

command_count = len(list((ROOT / 'src' / 'commands').rglob('*.js')))
print('BlaZe project structure: OK')
print(f'Prefix commands found: {command_count}')
print('Environment template keys: OK')
print('Reminder: configure secrets in your local .env or deployment secret manager.')

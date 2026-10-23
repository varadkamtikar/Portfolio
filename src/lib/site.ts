import { existsSync } from 'node:fs';
import profile from '../../content/profile.json';

/** The CV buttons only render when the PDF exists in public/, so the site never links to a 404. */
export const hasCv = existsSync(`public${profile.cv.file}`);

import {buildRezzy} from './rezzy.ts';
import {ResumeSchema} from 'npm:@kurone-kito/jsonresume-types@0.4.0';

const text = await Deno.readTextFile("data/resume.json");
const jsonData = JSON.parse(text);
console.log(buildRezzy(jsonData as ResumeSchema).join('\n'));

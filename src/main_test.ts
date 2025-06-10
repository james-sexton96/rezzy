import { assertEquals } from "@std/assert";
import {latexCommand} from './latex.ts';

Deno.test('latexCommand - 1', function addTest() {
  const expected = `\\cmd`;
  const actual = latexCommand('cmd', [])
  assertEquals(actual, expected);
});
Deno.test('latexCommand - 2', function addTest() {
  const expected = `\\cmd{arg1}{arg2}`;
  const actual = latexCommand('cmd', ['arg1', 'arg2'])
  assertEquals(actual, expected);
});
Deno.test('latexCommand - 3', function addTest() {
  const expected = `\\cmd[opt]{arg1}{arg2}`;
  const actual = latexCommand('cmd', ['arg1', 'arg2'], 'opt')
  assertEquals(actual, expected);
});
Deno.test('latexCommand - nested', function addTest() {
  const expected = `\\cmda[opta]{\\cmdb[optb]{argb1}{argb2}}{arga2}`;
  const actual = latexCommand('cmda', [latexCommand('cmdb', ['argb1', 'argb2'], 'optb'), 'arga2'], 'opta')
  assertEquals(actual, expected);
});
Deno.test('latexCommand - env commands', function addTest() {
  const expected = `\\begin{table}[h]`;
  const actual = latexCommand('begin', ['table'], 'h')
  assertEquals(actual, expected);
});

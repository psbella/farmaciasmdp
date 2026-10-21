// farmacias.html se genera con `npm run directorio` a partir de db.json.
// Si este test falla: correr `npm run directorio` y commitear farmacias.html.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { aplicarBloque, farmaciasUnicas, generarBloque } from '../scripts/directorio.mjs';

// Se normaliza CRLF -> LF: en Windows git puede entregar el archivo con CRLF.
const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const db = JSON.parse(leer('../db.json'));

test('farmacias.html está sincronizado con db.json', () => {
  const html = leer('../farmacias.html');
  assert.equal(aplicarBloque(html, generarBloque(db)), html);
});

test('el directorio no repite farmacias y todas tienen nombre y dirección', () => {
  const todas = farmaciasUnicas(db);
  assert.ok(todas.length > 0);
  assert.ok(todas.every((f) => f.nombre && f.direccion));
  assert.equal(new Set(todas.map((f) => `${f.nombre}|${f.direccion}`)).size, todas.length);
});

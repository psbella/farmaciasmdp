// Genera la lista de farmacias.html a partir de db.json.
//
// Uso:  npm run directorio   (reescribe solo lo que está entre los marcadores
// DIRECTORIO:INICIO / DIRECTORIO:FIN de farmacias.html; el resto es HTML a mano).
// Hay que correrlo cada vez que cambie nombre, dirección o teléfono en db.json;
// tests/directorio.test.mjs falla en CI si farmacias.html quedó desactualizado.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeHtml } from '../js/escape.js';
import { limpiarTelefono } from '../js/data.js';

const INICIO = '<!-- DIRECTORIO:INICIO -->';
const FIN = '<!-- DIRECTORIO:FIN -->';

// Mismo criterio de unicidad que "Ver todas" en js/ui.js: nombre + dirección.
export function farmaciasUnicas(db) {
  const mapa = new Map();
  for (const lista of Object.values(db)) {
    if (!Array.isArray(lista)) continue;
    for (const f of lista) {
      const clave = `${f.nombre}|${f.direccion}`;
      if (!mapa.has(clave)) mapa.set(clave, f);
    }
  }
  return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

function letraDe(nombre) {
  const l = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0).toUpperCase();
  return /[A-Z]/.test(l) ? l : '#';
}

export function generarBloque(db) {
  const todas = farmaciasUnicas(db);
  const porLetra = new Map();
  for (const f of todas) {
    const l = letraDe(f.nombre);
    if (!porLetra.has(l)) porLetra.set(l, []);
    porLetra.get(l).push(f);
  }
  const id = (l) => (l === '#' ? 'letra-num' : `letra-${l}`);
  const indice = [...porLetra.keys()].map((l) => `<a href="#${id(l)}">${l}</a>`).join('\n      ');
  const secciones = [...porLetra].map(([l, lista]) => {
    const items = lista.map((f) => {
      const tel = limpiarTelefono(f.telefono);
      const telHtml = tel
        ? `<a href="tel:${escapeHtml(tel)}">${escapeHtml(f.telefono)}</a>`
        : '<span class="dir-dato">Sin teléfono</span>';
      return `        <li><span class="dir-nombre">${escapeHtml(f.nombre)}</span><span class="dir-dato">${escapeHtml(f.direccion)}</span>${telHtml}</li>`;
    }).join('\n');
    return `    <h2 class="dir-letra" id="${id(l)}">${l}</h2>\n    <ul class="dir-lista">\n${items}\n    </ul>`;
  }).join('\n');

  return `    <p class="dir-total"><strong>${todas.length}</strong> farmacias registradas, ordenadas alfabéticamente.</p>\n    <nav class="dir-indice" aria-label="Ir a la letra">\n      ${indice}\n    </nav>\n${secciones}`;
}

export function aplicarBloque(html, bloque) {
  const i = html.indexOf(INICIO);
  const j = html.indexOf(FIN);
  if (i < 0 || j < i) throw new Error('Faltan los marcadores DIRECTORIO:INICIO / DIRECTORIO:FIN en farmacias.html');
  return `${html.slice(0, i + INICIO.length)}\n${bloque}\n    ${html.slice(j)}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const raiz = new URL('../', import.meta.url);
  const db = JSON.parse(readFileSync(new URL('db.json', raiz), 'utf8'));
  const ruta = new URL('farmacias.html', raiz);
  const actual = readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n');
  writeFileSync(ruta, aplicarBloque(actual, generarBloque(db)));
  console.log(`farmacias.html actualizado: ${farmaciasUnicas(db).length} farmacias`);
}

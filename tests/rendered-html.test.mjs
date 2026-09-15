import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders the dual MetroClima experience and both specialties", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /Climatización/);
  assert.match(html, /Electricidad/);
  assert.match(html, /Resultados que se pueden ver/);
  assert.match(html, /CABA y Gran Buenos Aires/);
  assert.match(html, /\+54 9 11 6922-1486/);

  const climateResponse = await worker.fetch(new Request("http://localhost/climatizacion"), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
  const climateHtml = await climateResponse.text();
  assert.match(climateHtml, /Preinstalaciones/);
  assert.match(climateHtml, /Sistemas VRV \/ VRF/);

  const electricResponse = await worker.fetch(new Request("http://localhost/electricidad"), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
  const electricHtml = await electricResponse.text();
  assert.match(electricHtml, /Tableros y protecciones/);
  assert.match(electricHtml, /Circuitos para climatización/);

  const serviceImages = [
    "servicio-preinstalacion.webp",
    "servicio-split-multisplit.webp",
    "servicio-piso-techo.webp",
    "servicio-vrv-vrf.webp",
    "servicio-mantenimiento.webp",
    "servicio-diagnostico.webp",
  ];

  for (const image of serviceImages) {
    assert.match(climateHtml, new RegExp(`/${image}`));
    await access(new URL(`../public/${image}`, import.meta.url));
  }

  assert.equal(new Set(serviceImages).size, 6);
});

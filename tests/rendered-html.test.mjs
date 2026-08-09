import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
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
  assert.match(html, /Preinstalaciones/);
  assert.match(html, /Sistemas VRV \/ VRF/);
  assert.match(html, /CABA y Gran Buenos Aires/);
  assert.match(html, /\+54 9 11 6922-1486/);

  const serviceImages = [
    "servicio-preinstalacion.webp",
    "servicio-split-multisplit.webp",
    "servicio-piso-techo.webp",
    "servicio-vrv-vrf.webp",
    "servicio-mantenimiento.webp",
    "servicio-diagnostico.webp",
  ];

  for (const image of serviceImages) {
    assert.match(html, new RegExp(`/${image}`));
    await access(new URL(`../public/${image}`, import.meta.url));
  }

  assert.equal(new Set(serviceImages).size, 6);
});

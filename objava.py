#!/usr/bin/env python3
"""Objava svih demo stranica iz ovog repozitorija u _site/<slug>/ (GitHub Pages).

Svaka podmapa sa site.json je jedna stranica. Pokreće se u GitHub Actions nakon svake promjene.
Lokalno:  PREVIEW=1 python3 objava.py
"""
import json
import os
import shutil
import sys
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
os.chdir(ROOT)
import objava_cms  # noqa: E402

OUT = os.path.join(ROOT, "_site")
if os.path.isdir(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)
n = 0
for slug in sorted(os.listdir(ROOT)):
    cfg = os.path.join(ROOT, slug, "site.json")
    if not os.path.isfile(cfg):
        continue
    c = json.load(open(cfg, encoding="utf-8"))
    en = c.get("lang", "hr") == "en"
    concept = c.get("concept") or (f"Redesign concept – not the official website of {c['name']}" if en
                                   else f"Prijedlog redizajna – nije službena stranica tvrtke {c['name']}")
    buttons = c.get("demo_buttons") or [["uredi.html?demo", "Edit this website (demo)" if en else "Uredi stranicu (demo)"]]
    objava_cms.collect(os.path.join(ROOT, slug), c["public"], out=os.path.join(OUT, slug),
                       demo_pages=tuple(c.get("demo_pages", ["index.html"])), demo_buttons=[tuple(b) for b in buttons], concept=concept)
    n += 1
open(os.path.join(OUT, ".nojekyll"), "w").close()
open(os.path.join(OUT, "robots.txt"), "w").write("User-agent: *\nDisallow: /\n")
open(os.path.join(OUT, "index.html"), "w").write('<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Demo</title><p style="font:16px system-ui;padding:40px">Demo.</p>')
json.dump({"sha": objava_cms.sha(), "time": int(time.time())}, open(os.path.join(OUT, "version.json"), "w"))
print(f"✓ {n} stranica u _site/")

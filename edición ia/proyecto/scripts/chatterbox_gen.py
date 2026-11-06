"""Genera voz con Chatterbox (multilingüe, español). Se corre con el Python del entorno aparte:
  voces/venv-chatterbox/bin/python scripts/chatterbox_gen.py <pedidos.json> <carpeta-salida> [--perfil locutor]
pedidos.json: lista de {"id": "...", "texto": "...", "semilla": 7}. Guarda <carpeta>/<id>.wav por pedido.
La revisión (que no invente palabras) la hace scripts/voz.py.
"""
import json, os, sys
os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
import torch, torchaudio
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

PERFILES = {
    "locutor": dict(exaggeration=0.75, cfg_weight=0.45, temperature=0.8),
    # "natural" y "cercana" inventan palabras con frecuencia: no usar en videos
    "natural": dict(exaggeration=0.4, cfg_weight=0.3, temperature=0.8),
    "cercana": dict(exaggeration=0.3, cfg_weight=0.25, temperature=0.7),
}
args = sys.argv[1:]
pedidos = json.load(open(args[0], encoding="utf-8"))
salida = args[1]
perfil = PERFILES[args[args.index("--perfil") + 1] if "--perfil" in args else "locutor"]
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
for p in pedidos:
    torch.manual_seed(p["semilla"])
    w = m.generate(p["texto"], language_id="es", **perfil)
    torchaudio.save(os.path.join(salida, f'{p["id"]}.wav'), w, m.sr)
    print("hecho", p["id"], flush=True)

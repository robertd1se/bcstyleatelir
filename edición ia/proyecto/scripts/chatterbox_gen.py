"""Genera voz con Chatterbox (multilingüe, español). Se corre con el Python del entorno aparte:
  voces/venv-chatterbox/bin/python scripts/chatterbox_gen.py <oraciones.json> <salida.wav> [--perfil natural|locutor|cercana]
oraciones.json: lista de textos (uno por oración). Entre oraciones deja una pausa natural.
"""
import json, os, sys
os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
import torch, torchaudio
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

PERFILES = {
    "natural": dict(exaggeration=0.4, cfg_weight=0.3, temperature=0.8),
    "locutor": dict(exaggeration=0.75, cfg_weight=0.45, temperature=0.8),
    "cercana": dict(exaggeration=0.3, cfg_weight=0.25, temperature=0.7),
}
args = sys.argv[1:]
oraciones = json.load(open(args[0], encoding="utf-8"))
perfil = PERFILES[args[args.index("--perfil") + 1] if "--perfil" in args else "locutor"]
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
torch.manual_seed(7)
partes = []
for o in oraciones:
    partes.append(m.generate(o, language_id="es", **perfil))
    pausa = 0.38 if o.rstrip().endswith(("?", ".", "!")) else 0.22
    partes.append(torch.zeros(1, int(pausa * m.sr)))
torchaudio.save(args[1], torch.cat(partes, dim=1), m.sr)

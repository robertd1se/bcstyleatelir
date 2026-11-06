"""Voz en off con ElevenLabs + tiempos exactos por palabra (alineación de ElevenLabs).

Uso: python3 scripts/voz_elevenlabs.py <guion.txt> <carpeta-salida> --voz <voice_id>
       [--modelo eleven_multilingual_v2] [--estabilidad 0.45] [--estilo 0.35] [--velocidad 1.0]

La API key la agrega el proxy de la nube (cabecera xi-api-key); no hace falta ponerla acá.
En el guion, {lo que se dice|lo que se muestra}: {Roxet|RXT}, {uno|1.}
Salida: <carpeta>/voz.mp3 y <carpeta>/palabras.json (lista de Caption).
"""
import base64, json, os, re, sys, urllib.request

args = sys.argv[1:]
guion_path, salida = os.path.abspath(args[0]), os.path.abspath(args[1])
op = lambda n, d: type(d)(args[args.index(n) + 1]) if n in args else d
VOZ = op("--voz", "")
if not VOZ:
    sys.exit("Falta --voz <voice_id>")
os.makedirs(salida, exist_ok=True)

guion = open(guion_path, encoding="utf-8").read().strip()
palabras = []  # (dicho, mostrado)
for m in re.finditer(r"\{([^|}]+)\|([^}]+)\}(\S*)|(\S+)", guion):
    if m.group(4):
        palabras.append((m.group(4), m.group(4)))
    else:
        dichas = m.group(1).split()
        palabras.append((dichas[0], m.group(2) + m.group(3)))
        palabras.extend((d, "") for d in dichas[1:])
texto = " ".join(d for d, _ in palabras)

cuerpo = {
    "text": texto,
    "model_id": op("--modelo", "eleven_multilingual_v2"),
    "language_code": "es",
    "voice_settings": {
        "stability": op("--estabilidad", 0.45),
        "similarity_boost": 0.8,
        "style": op("--estilo", 0.35),
        "use_speaker_boost": True,
        "speed": op("--velocidad", 1.0),
    },
}
req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/text-to-speech/{VOZ}/with-timestamps?output_format=mp3_44100_192",
    data=json.dumps(cuerpo).encode(),
    headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"},
)
try:
    resp = json.load(urllib.request.urlopen(req, timeout=180))
except urllib.error.HTTPError as e:
    sys.exit(f"ElevenLabs respondió {e.code}: {e.read().decode()[:400]}")
open(os.path.join(salida, "voz.mp3"), "wb").write(base64.b64decode(resp["audio_base64"]))

# Alineación por caracteres → por palabra (el texto enviado son las palabras unidas por un espacio)
al = resp.get("normalized_alignment") or resp["alignment"]
chars, ini, fin = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
if "".join(chars) != texto:
    al = resp["alignment"]
    chars, ini, fin = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
captions, pos = [], 0
for dicho, mostrado in palabras:
    k = "".join(chars).find(dicho, pos)
    if k < 0:
        k = pos
    a, b = k, min(k + len(dicho), len(chars)) - 1
    pos = b + 1
    if mostrado:
        captions.append({"text": mostrado, "startMs": round(ini[a] * 1000), "endMs": round(fin[b] * 1000), "timestampMs": None, "confidence": 1})
json.dump(captions, open(os.path.join(salida, "palabras.json"), "w"), ensure_ascii=False, indent=1)
print(f"{fin[-1]:.1f} s de voz, {len(captions)} palabras → {salida}")

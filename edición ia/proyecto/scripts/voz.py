"""Genera la voz en off con Piper y los tiempos por palabra, alineados al guion.

Uso: python3 scripts/voz.py <guion.txt> <carpeta-salida> [--velocidad 0.9]

El guion es texto plano. Para que la voz pronuncie una cosa y en pantalla se lea otra,
escribí {lo que se dice|lo que se muestra}, por ejemplo: {Roxet|RXT}, {uno|1.}
Salida: <carpeta>/voz.wav y <carpeta>/palabras.json (lista de Caption con el texto del guion).
"""
import difflib, json, os, re, subprocess, sys, tempfile, unicodedata

PROYECTO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOZ = os.path.join(PROYECTO, "voces", "es_MX-claude-high.onnx")

args = sys.argv[1:]
guion_path, salida = os.path.abspath(args[0]), os.path.abspath(args[1])
velocidad = args[args.index("--velocidad") + 1] if "--velocidad" in args else "0.9"
os.makedirs(salida, exist_ok=True)

guion = open(guion_path, encoding="utf-8").read().strip()
# palabras: (dicho, mostrado)
palabras = []
for m in re.finditer(r"\{([^|}]+)\|([^}]+)\}(\S*)|(\S+)", guion):
    if m.group(4):
        palabras.append((m.group(4), m.group(4)))
    else:
        dichas = m.group(1).split()
        # lo mostrado (más la puntuación pegada, ej. "?") va sobre la primera palabra dicha
        palabras.append((dichas[0], m.group(2) + m.group(3)))
        palabras.extend((d, "") for d in dichas[1:])
texto_dicho = re.sub(r"\{([^|}]+)\|[^}]+\}", r"\1", guion)

wav = os.path.join(salida, "voz.wav")
subprocess.run([sys.executable, "-m", "piper", "-m", VOZ, "--length-scale", velocidad,
                "--sentence-silence", "0.25", "-f", wav], input=texto_dicho.encode(), check=True,
               stderr=subprocess.DEVNULL)

subprocess.run(["node", os.path.join(PROYECTO, "scripts", "transcribir.mjs"), wav, "es"], check=True,
               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, cwd=tempfile.gettempdir())
whisper = json.load(open(wav + ".captions.json"))
os.remove(wav + ".captions.json")

def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    return re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in t if unicodedata.category(c) != "Mn"))

w_norm = [norm(c["text"]) for c in whisper]
g_norm = [norm(d) for d, _ in palabras]
tiempos = [None] * len(palabras)
for a, b, n in difflib.SequenceMatcher(None, g_norm, w_norm, autojunk=False).get_matching_blocks():
    for k in range(n):
        tiempos[a + k] = (whisper[b + k]["startMs"], whisper[b + k]["endMs"])

# las palabras sin coincidencia se interpolan entre sus vecinas
fin_total = whisper[-1]["endMs"] if whisper else 0
i = 0
while i < len(tiempos):
    if tiempos[i] is None:
        j = i
        while j < len(tiempos) and tiempos[j] is None:
            j += 1
        desde = tiempos[i - 1][1] if i > 0 else 0
        hasta = tiempos[j][0] if j < len(tiempos) else fin_total
        paso = (hasta - desde) / (j - i)
        for k in range(i, j):
            tiempos[k] = (round(desde + paso * (k - i)), round(desde + paso * (k - i + 1)))
        i = j
    else:
        i += 1

captions = [
    {"text": mostrado, "startMs": t[0], "endMs": t[1], "timestampMs": None, "confidence": 1}
    for (_, mostrado), t in zip(palabras, tiempos) if mostrado
]
json.dump(captions, open(os.path.join(salida, "palabras.json"), "w"), ensure_ascii=False, indent=1)
sin = sum(1 for t in tiempos if t is None)
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]))
coinciden = sum(n for *_, n in difflib.SequenceMatcher(None, g_norm, w_norm, autojunk=False).get_matching_blocks())
print(f"{dur:.1f} s de voz, {len(captions)} palabras, {coinciden}/{len(palabras)} alineadas con Whisper")

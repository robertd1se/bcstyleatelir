"""Genera la voz en off con Piper y los tiempos por palabra, alineados al guion.

Uso: python3 scripts/voz.py <guion.txt> <carpeta-salida> [--motor kokoro|piper] [--voz em_alex] [--velocidad 1.05]

Motores: chatterbox (por defecto, la más humana; --perfil natural|locutor|cercana), kokoro (voces em_alex,
em_santa, ef_dora) o piper (es_MX-claude-high).
Después de generar, la voz pasa por una cadena de "locutor": filtro de graves, calidez, presencia,
control de sibilantes, compresión, un toque de sala y limitador.

El guion es texto plano. Para que la voz pronuncie una cosa y en pantalla se lea otra,
escribí {lo que se dice|lo que se muestra}, por ejemplo: {Roxet|RXT}, {uno|1.}
Salida: <carpeta>/voz.wav y <carpeta>/palabras.json (lista de Caption con el texto del guion).
"""
import difflib, json, os, re, subprocess, sys, tempfile, unicodedata

PROYECTO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOZ = os.path.join(PROYECTO, "voces", "es_MX-claude-high.onnx")

args = sys.argv[1:]
guion_path, salida = os.path.abspath(args[0]), os.path.abspath(args[1])
op = lambda n, d: args[args.index(n) + 1] if n in args else d
motor = op("--motor", "chatterbox")
perfil = op("--perfil", "locutor")
tempo = float(op("--tempo", "1.1" if motor == "chatterbox" else "1.0"))  # acelera sin cambiar el tono  # natural y cercana inventan palabras: no usar
velocidad = op("--velocidad", "1.05" if motor == "kokoro" else "0.9")
voz_kokoro = op("--voz", "em_alex")
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
crudo = os.path.join(tempfile.gettempdir(), "voz-cruda.wav")
if motor == "chatterbox":
    import difflib
    import numpy as np
    import soundfile as sf
    # 1) oraciones; las muy cortas ("Uno.") se juntan con la siguiente: ahí Chatterbox suele inventar
    oraciones = [o for o in re.split(r"(?<=[.?!:])\s+", texto_dicho.replace("\n", " ")) if o.strip()]
    trozos, acum = [], ""
    for o in oraciones:
        acum = f"{acum} {o}".strip()
        if len(acum.split()) >= 5:
            trozos.append(acum)
            acum = ""
    if acum:
        if trozos and len(acum.split()) < 4:
            trozos[-1] += " " + acum
        else:
            trozos.append(acum)
    tmp = tempfile.mkdtemp(prefix="cb-")
    py_cb = os.path.join(PROYECTO, "voces", "venv-chatterbox", "bin", "python")
    entorno = {**os.environ, "HF_HUB_OFFLINE": os.environ.get("HF_HUB_OFFLINE", "1"), "HF_HUB_DISABLE_XET": "1"}

    NUMEROS = {"1": "uno", "2": "dos", "3": "tres", "4": "cuatro", "5": "cinco", "6": "seis", "7": "siete", "8": "ocho", "9": "nueve", "10": "diez"}

    def normal(t):
        t = re.sub(r"\d+", lambda m: f" {NUMEROS.get(m.group(), m.group())} ", t)
        t = unicodedata.normalize("NFD", t.lower())
        return " ".join("".join(c for c in t if unicodedata.category(c) != "Mn" and (c.isalnum() or c == " ")).split())

    def revisar(wav_trozo, esperado):
        subprocess.run(["node", os.path.join(PROYECTO, "scripts", "transcribir.mjs"), wav_trozo, "es"], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, cwd=tempfile.gettempdir())
        caps = json.load(open(wav_trozo + ".captions.json"))
        oido = re.sub(r"\[[^\]]*\]", " ", "".join(c["text"] for c in caps))  # saca "[Música]" y similares
        esp, oi = normal(esperado).split(), normal(oido).split()
        # tolera errores de escritura de Whisper (marca, plurales): una palabra oída muy parecida a una esperada cuenta como esa
        oi = [max(esp, key=lambda e: difflib.SequenceMatcher(None, w, e).ratio()) if esp and max(difflib.SequenceMatcher(None, w, e).ratio() for e in esp) >= 0.7 else w for w in oi]
        parecido = difflib.SequenceMatcher(None, esp, oi).ratio()
        if len(oi) > len(esp):  # dijo palabras de más (repitió, inventó o agregó muletillas)
            parecido -= 0.2
        dur = sf.info(wav_trozo).duration
        maximo = 0.085 * len(esperado) + 1.2  # más largo que esto = está inventando
        # una palabra que "dura" demasiado esconde un ruido o una muletilla pegada (ej. "necesidades... ya")
        reales = [c for c in caps if re.sub(r"\[[^\]]*\]", "", c["text"]).strip()]
        if reales and max(c["endMs"] - c["startMs"] for c in reales) > 1100:
            parecido -= 0.3
        return parecido, dur, maximo, oido

    import hashlib, shutil
    cache = os.path.join(salida, "trozos")
    os.makedirs(cache, exist_ok=True)
    clave = lambda t: hashlib.sha1(f"{perfil}|{t}".encode()).hexdigest()[:12]
    mejores = {}  # id -> (puntaje, ruta)
    pendientes = []
    for i, t in enumerate(trozos):
        guardado = os.path.join(cache, clave(t) + ".wav")
        if os.path.exists(guardado):
            mejores[i] = (1.0, guardado)
            print(f"  trozo {i + 1}/{len(trozos)}: ya aprobado antes (se reutiliza)")
        else:
            pendientes.append(i)
    for ronda in range(5):
        if not pendientes:
            break
        pedidos = [{"id": f"t{i}-r{ronda}", "texto": trozos[i], "semilla": 7 + ronda * 101 + i} for i in pendientes]
        lista = os.path.join(tmp, f"pedidos-{ronda}.json")
        json.dump(pedidos, open(lista, "w"), ensure_ascii=False)
        subprocess.run([py_cb, os.path.join(PROYECTO, "scripts", "chatterbox_gen.py"), lista, tmp, "--perfil", perfil],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=entorno)
        siguen = []
        for i in pendientes:
            ruta = os.path.join(tmp, f"t{i}-r{ronda}.wav")
            parecido, dur, maximo, oido = revisar(ruta, trozos[i])
            puntaje = parecido - (0.5 if dur > maximo else 0)
            if i not in mejores or puntaje > mejores[i][0]:
                mejores[i] = (puntaje, ruta)
            ok = parecido >= 0.86 and dur <= maximo
            print(f"  trozo {i + 1}/{len(trozos)} ronda {ronda + 1}: parecido {parecido:.2f}, {dur:.1f}s (máx {maximo:.1f}) {'OK' if ok else 'REHACER'}  «{oido.strip()[:70]}»")
            if ok:
                shutil.copy(ruta, os.path.join(cache, clave(trozos[i]) + ".wav"))
            if not ok:
                siguen.append(i)
        pendientes = siguen
    if pendientes:
        print(f"  AVISO: {len(pendientes)} trozo(s) no quedaron perfectos; se usa la mejor toma de cada uno")
    def recortar(ruta):
        # deja solo desde la primera palabra real hasta la última (+ un respiro): saca colas y ruidos sueltos
        subprocess.run(["node", os.path.join(PROYECTO, "scripts", "transcribir.mjs"), ruta, "es"], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, cwd=tempfile.gettempdir())
        caps = [c for c in json.load(open(ruta + ".captions.json")) if re.sub(r"\[[^\]]*\]", "", c["text"]).strip()]
        a, sr_ = sf.read(ruta)
        if caps:
            ini = max(0, int((caps[0]["startMs"] - 80) / 1000 * sr_))
            fin = min(len(a), int((caps[-1]["endMs"] + 160) / 1000 * sr_))
            a = a[ini:fin].copy()
            rampa = min(len(a), int(0.02 * sr_))  # 20 ms de fundido en los bordes para que no haga clic
            a[:rampa] *= np.linspace(0, 1, rampa)[:, None] if a.ndim > 1 else np.linspace(0, 1, rampa)
            a[-rampa:] *= np.linspace(1, 0, rampa)[:, None] if a.ndim > 1 else np.linspace(1, 0, rampa)
        return a, sr_

    partes, sr = [], None
    for i, t in enumerate(trozos):
        a, sr = recortar(mejores[i][1])
        partes += [a, np.zeros(int((0.38 if t.endswith(("?", ".", "!")) else 0.22) * sr))]
    sf.write(crudo, np.concatenate(partes), sr)
elif motor == "piper":
    subprocess.run([sys.executable, "-m", "piper", "-m", VOZ, "--length-scale", velocidad,
                    "--sentence-silence", "0.25", "-f", crudo], input=texto_dicho.encode(), check=True,
                   stderr=subprocess.DEVNULL)
else:
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(PROYECTO, "voces", "kokoro-v1.0.onnx"), os.path.join(PROYECTO, "voces", "voices-v1.0.bin"))
    # oración por oración, con pausas naturales (más larga después de una pregunta o un punto)
    oraciones = [o for o in re.split(r"(?<=[.?!:])\s+", texto_dicho.replace("\n", " ")) if o.strip()]
    partes, sr = [], 24000
    for o in oraciones:
        a, sr = k.create(o, voice=voz_kokoro, speed=float(velocidad), lang="es")
        pausa = 0.32 if o.endswith(("?", ".")) else 0.18
        partes += [a, np.zeros(int(pausa * sr), dtype=a.dtype)]
    sf.write(crudo, np.concatenate(partes), sr)

if abs(tempo - 1.0) > 0.01:
    acelerado = crudo.replace(".wav", "-tempo.wav")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", crudo, "-af", f"atempo={tempo}", acelerado], check=True)
    os.replace(acelerado, crudo)

# cadena de locutor
from pedalboard import Pedalboard, HighpassFilter, LowShelfFilter, PeakFilter, HighShelfFilter, Compressor, Reverb, Limiter, Gain
from pedalboard.io import AudioFile
with AudioFile(crudo).resampled_to(48000) as f:
    audio = f.read(f.frames)
locutor = Pedalboard([
    HighpassFilter(85),
    LowShelfFilter(cutoff_frequency_hz=180, gain_db=2.5),
    PeakFilter(cutoff_frequency_hz=350, gain_db=-2, q=1.0),     # saca "caja"
    PeakFilter(cutoff_frequency_hz=3200, gain_db=3, q=0.9),     # presencia
    PeakFilter(cutoff_frequency_hz=7000, gain_db=-3.5, q=2.5),  # baja las "s"
    HighShelfFilter(cutoff_frequency_hz=11000, gain_db=1.5),    # aire
    Compressor(threshold_db=-20, ratio=3, attack_ms=8, release_ms=120),
    Reverb(room_size=0.18, damping=0.7, wet_level=0.05, dry_level=1.0, width=0.6),
    Gain(3),
    Limiter(threshold_db=-1.5),
])
with AudioFile(wav, "w", 48000, audio.shape[0]) as f:
    f.write(locutor(audio, 48000))
os.remove(crudo)

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

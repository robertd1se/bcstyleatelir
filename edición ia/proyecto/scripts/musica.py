"""Compone una base instrumental original para videos de gym (sin derechos de terceros).

Uso: python3 scripts/musica.py <salida.wav> [--duracion 40] [--bpm 100] [--semilla 1] [--estilo oscuro|fresco]
Estilos: "oscuro" (por defecto, gym en La menor) y "fresco" (house/pop luminoso en Do mayor, bajo en contratiempo,
hi-hat abierto en el "y", pluck brillante; usar con --bpm 120).
Estilo: electrónica oscura en La menor (Am–F–C–G): bombo, palmas, hi-hats, bajo con
"sidechain", pad ancho y arpegio con eco. Intro filtrada de 1 compás y final con caída.
"""
import sys
import numpy as np
from pedalboard import Pedalboard, Compressor, Reverb, LowpassFilter, HighpassFilter, Delay, Limiter, Gain, Chorus
from pedalboard.io import AudioFile

args = sys.argv[1:]
salida = args[0]
op = lambda n, d: type(d)(args[args.index(n) + 1]) if n in args else d
DUR = op("--duracion", 40.0)
BPM = op("--bpm", 100.0)
rng = np.random.default_rng(op("--semilla", 1))
ESTILO = op("--estilo", "oscuro")
FRESCO = ESTILO == "fresco"
SR = 44100
N = int(DUR * SR)
negra = 60 / BPM
compas = 4 * negra
t_total = np.arange(N) / SR

def env(n, ataque, caida):
    a = int(ataque * SR); a = max(a, 1)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e *= np.exp(-np.arange(n) / (caida * SR))
    return e

def colocar(pista, sonido, seg):
    i = int(seg * SR)
    if i >= len(pista): return
    fin = min(len(pista), i + len(sonido))
    pista[i:fin] += sonido[: fin - i]

def nota(m):  # midi → Hz
    return 440 * 2 ** ((m - 69) / 12)

# --- sonidos ---
def bombo():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 30)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = rng.standard_normal(n) * np.exp(-t * 400) * 0.3
    return np.tanh((s + click) * 1.6)

def palmas():
    n = int(0.35 * SR); t = np.arange(n) / SR
    ruido = rng.standard_normal(n)
    e = np.zeros(n)
    for d in (0, 0.011, 0.023):  # tres golpes muy juntos
        i = int(d * SR); e[i:] += np.exp(-np.arange(n - i) / (0.06 * SR))
    tono = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.4
    s = ruido * e * 0.5 + tono
    return HighpassFilter(900)(s.astype(np.float32), SR)

def hat(abierto=False):
    n = int((0.25 if abierto else 0.05) * SR); t = np.arange(n) / SR
    s = rng.standard_normal(n) * np.exp(-t * (14 if abierto else 90))
    return HighpassFilter(7000)(s.astype(np.float32), SR)

def sierra(f, n, desafinado=0.0):
    t = np.arange(n) / SR
    s = np.zeros(n)
    for d in (-desafinado, 0, desafinado):
        fase = (t * f * (1 + d)) % 1
        s += 2 * fase - 1
    return s / 3

# --- armonía: Am F C G (raíces y acordes) ---
ACORDES = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]
if FRESCO:  # Do – Sol – Lam – Fa, voces en registro medio-alto (luminoso)
    ACORDES = [(48, [60, 64, 67]), (55, [59, 62, 67]), (57, [60, 64, 69]), (53, [60, 65, 69])]
compases = int(np.ceil(DUR / compas))

bat = np.zeros(N); bajo = np.zeros(N); pad = np.zeros(N); arp = np.zeros(N); hats = np.zeros(N)
B, P, H = bombo(), palmas(), hat()
HA = hat(True)
for c in range(compases):
    t0 = c * compas
    raiz, acorde = ACORDES[c % 4]
    intro = c == 0
    final = t0 > DUR - compas * 1.01
    # batería (sin bombo en la intro)
    if not intro:
        for b in (0, 1, 2, 3):
            colocar(bat, B, t0 + b * negra)
        if c % 2: colocar(bat, B * 0.7, t0 + 3.5 * negra)
        for b in (1, 3):
            colocar(bat, P * 0.9, t0 + b * negra)
    for k in range(16 if not intro else 8):
        paso = negra / 4 if not intro else negra / 2
        vel = 0.5 + 0.3 * (k % 2 == 0) + rng.uniform(-0.1, 0.1)
        colocar(hats, H * vel, t0 + k * paso)
    if not intro: colocar(hats, HA * 0.5, t0 + 3.5 * negra)
    if FRESCO and not intro:  # hi-hat abierto en cada contratiempo (house)
        for b in range(4):
            colocar(hats, HA * 0.55, t0 + (b + 0.5) * negra)
    # bajo: corcheas en la raíz, con octava
    if not intro:
        for k in range(8):
            if FRESCO and k % 2 == 0:  # bajo solo en el contratiempo: rebota con el bombo
                continue
            f = nota(raiz - 24 + (12 if k in (3, 7) else 0))
            n = int(negra / 2 * SR)
            tt = np.arange(n) / SR
            s = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt)) * env(n, 0.005, 0.18)
            colocar(bajo, np.tanh(s * 1.5), t0 + k * negra / 2)
    # pad: acorde sostenido todo el compás
    n = int(compas * SR)
    s = sum(sierra(nota(m), n, 0.006) for m in acorde) / 3
    colocar(pad, s * env(n, 0.4, 6), t0)
    # arpegio en semicorcheas (a partir del compás 3)
    if (c >= 1 if FRESCO else c >= 2) and not final:
        patron = [0, 1, 2, 1, 2, 0, 1, 2] * 2
        for k, idx in enumerate(patron):
            m = acorde[idx] + 12 + (12 if k % 8 == 6 else 0)
            n = int(negra / 4 * SR * 0.9)
            colocar(arp, sierra(nota(m), n) * env(n, 0.003, 0.05 if FRESCO else 0.08) * 0.6, t0 + k * negra / 4)

# "sidechain": el bajo y el pad se agachan con cada negra (efecto bombeo)
fase = (t_total % negra) / negra
bombeo = np.clip(0.35 + fase * 2.2, 0, 1)
bombeo[: int(compas * SR)] = 1  # sin bombeo en la intro
bajo *= bombeo; pad *= (0.6 + 0.4 * bombeo)

fx = lambda x, cadena: cadena(x.astype(np.float32), SR)
pad = fx(pad, Pedalboard([LowpassFilter(3600 if FRESCO else 1800), Chorus(rate_hz=0.3, depth=0.4, mix=0.5), Reverb(room_size=0.6 if FRESCO else 0.85, wet_level=0.3 if FRESCO else 0.45, dry_level=0.6, width=1.0)]))
arp = fx(arp, Pedalboard([LowpassFilter(6500 if FRESCO else 3200), Delay(delay_seconds=negra * 0.75, feedback=0.35, mix=0.3), Reverb(room_size=0.6, wet_level=0.25)]))
bajo = fx(bajo, Pedalboard([LowpassFilter(400)]))
bat = fx(bat, Pedalboard([Compressor(threshold_db=-14, ratio=4, attack_ms=5, release_ms=80)]))
hats = fx(hats, Pedalboard([Reverb(room_size=0.3, wet_level=0.15)]))

mezcla = 0.95 * bat + 0.75 * bajo + 0.35 * pad + (0.34 if FRESCO else 0.22) * arp + (0.36 if FRESCO else 0.3) * hats

# intro filtrada (se abre en el primer compás) y caída final de 1,5 s
i_intro = int(compas * SR)
lp = fx(mezcla[:i_intro], Pedalboard([LowpassFilter(700)]))
mezcla[:i_intro] = lp * np.linspace(0.5, 1, i_intro) + mezcla[:i_intro] * np.linspace(0, 0.3, i_intro)
caida = int(1.5 * SR)
mezcla[-caida:] *= np.linspace(1, 0, caida) ** 2

master = Pedalboard([HighpassFilter(30), Compressor(threshold_db=-12, ratio=2.5, attack_ms=20, release_ms=200), Gain(4), Limiter(threshold_db=-1)])
stereo = np.stack([mezcla, mezcla]).astype(np.float32)
# un poco de ancho estéreo: el pad y el arpegio corridos
ancho = (0.35 * pad + 0.22 * arp)
stereo[0] += 0.12 * np.roll(ancho, 220); stereo[1] -= 0.12 * np.roll(ancho, 220)
stereo = master(stereo, SR)
with AudioFile(salida, "w", SR, 2) as f:
    f.write(stereo)
print(f"{DUR:.1f} s a {BPM:.0f} BPM → {salida}")

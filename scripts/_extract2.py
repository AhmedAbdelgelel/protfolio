
import re, zlib, json, collections

data = open(r'E:\AhmedAbdelgelel.pdf','rb').read()
streams=[]
for m in re.finditer(rb'stream\r?\n', data):
    s=m.end(); e=data.find(b'endstream', s)
    if e==-1: continue
    try: streams.append(zlib.decompress(data[s:e]))
    except Exception: pass

# Gather all text-showing ops in order, with font + position
runs=[]  # (pageish index, font, x, y, kind, payload)
for idx,s in enumerate(streams):
    t=s.decode('latin-1')
    if 'BT' not in t: continue
    for m in re.finditer(r'/F?\w+ [\d.]+ Tf|1 0 0 1 ([\d.-]+) ([\d.-]+) Tm|(-?[\d.]+) (-?[\d.]+) TD|\[((?:<[0-9A-Fa-f]+>|\((?:[^()\\]|\\.)*\)|[-\d.]+|\s)+)\]TJ|<([0-9A-Fa-f]+)>Tj|\(((?:[^()\\]|\\.)*)\)Tj', t):
        runs.append((idx, m.group(0)))
print(len(runs))
open(r'E:\portfolio\.tmp_runs.txt','w',encoding='utf-8').write('\n'.join(f'{i}\t{r}' for i,r in runs))

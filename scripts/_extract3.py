
import re, zlib, collections, json

data = open(r'E:\AhmedAbdelgelel.pdf','rb').read()
streams=[]
for m in re.finditer(rb'stream\r?\n', data):
    s=m.end(); e=data.find(b'endstream', s)
    if e==-1: continue
    try: streams.append(zlib.decompress(data[s:e]))
    except Exception: pass

FREQ = collections.Counter('etaoinshrdlucmfwypvbgkjqxz ETAOIN')
def score(txt):
    if not txt: return -1e9
    good = sum(1 for c in txt if c in ' etaoinshrdlucmfwypvbgkjqxzETAOINSHRDLUCMFWYPVBGKJQXZ.,|()@+-:/')
    return good/len(txt) + 0.002*sum(FREQ.get(c,0) for c in txt)/max(1,len(txt))

runs=[]  # (stream, font, x, y, kind, data)
for idx,s in enumerate(streams):
    t=s.decode('latin-1')
    if 'BT' not in t: continue
    cur_font=None; cx=cy=0.0
    pat = re.compile(r'/([A-Za-z0-9]+)\s+[\d.]+\s+Tf|1 0 0 1 ([\d.-]+) ([\d.-]+) Tm|(-?[\d.]+)\s+(-?[\d.]+)\s+TD|\[((?:<[0-9A-Fa-f]+>|\((?:[^()\\]|\\.)*\)|-?[\d.]+|\s)+)\]\s*TJ|<([0-9A-Fa-f]+)>\s*Tj|\(((?:[^()\\]|\\.)*)\)\s*Tj')
    for m in pat.finditer(t):
        if m.group(1): cur_font=m.group(1)
        elif m.group(2): cx=float(m.group(2)); cy=float(m.group(3))
        elif m.group(4): cx+=float(m.group(4)); cy+=float(m.group(5))
        else:
            payload = m.group(6) or m.group(7) or m.group(8) or ''
            runs.append([idx, cur_font, round(cx,1), round(cy,1), payload])

# figure out hex offset per font
hexstrs=collections.defaultdict(list)
for r in runs:
    for h in re.findall(r'<([0-9A-Fa-f]+)>', r[4]):
        hexstrs[r[1]].append(h)
offsets={}
for fam, hs in hexstrs.items():
    codes=collections.Counter()
    for h in hs:
        if len(h)%4==0:
            for i in range(0,len(h),4): codes[int(h[i:i+4],16)]+=1
    best=None
    for off in range(0,0x120):
        txt=''.join(chr((c+off)&0xFFFF) for c in sorted(codes))
        s2=score(txt)
        if best is None or s2>best[1]: best=(off,s2)
    offsets[fam]=(best[0], best[1], len(codes))

print('hex font offsets:', {k:v for k,v in offsets.items()})

def decode_payload(fam, payload):
    out=[]
    for m in re.finditer(r'<([0-9A-Fa-f]+)>|\((?:[^()\\]|\\.)*\)', payload):
        if m.group(1):
            h=m.group(1); off=offsets.get(fam,(0,0,0))[0]
            for i in range(0,len(h)-3,4):
                c=int(h[i:i+4],16)+off
                out.append(chr(c) if 32<=c<0x2200 else '?')
        else:
            raw=m.group(0)[1:-1]
            raw=raw.replace('\\\\(','(').replace('\\\\)',')').replace('\\\\','\\')
            out.append(raw)
    return ''.join(out)

lines=collections.defaultdict(str)
for r in runs:
    txt=decode_payload(r[1], r[4])
    key=(r[0], r[3])
    lines[key]+=txt
# write ordered unique lines by y desc then x
byy=collections.defaultdict(list)
for r in runs:
    byy[(r[0], r[3])].append((r[2], decode_payload(r[1], r[4]), r[1]))
keys=sorted(byy.keys(), key=lambda k:(k[0], -k[1]))
outp=[]
for k in keys:
    segs=sorted(byy[k])
    outp.append(f'--- stream {k[0]} y={k[1]} ---')
    for x,txt,f in segs:
        outp.append(f'   x={x:7.2f} [{f}] {txt!r}')
open(r'E:\portfolio\.tmp_lines.txt','w',encoding='utf-8').write('\n'.join(outp))
print('lines written', len(keys))


import re, zlib, collections
data = open(r'E:\AhmedAbdelgelel.pdf','rb').read()
streams=[]
for m in re.finditer(rb'stream\r?\n', data):
    s=m.end(); e=data.find(b'endstream', s)
    if e==-1: continue
    try: streams.append(zlib.decompress(data[s:e]))
    except Exception: pass

OFF={'F1':29,'F2':29,'F5':29,'F6':29,'F7':29,'ArialMT':29,'TimesNewRomanPSMT':29,'Arial-BoldMT':29}
def dec(font, payload):
    out=[]
    for m in re.finditer(r'<([0-9A-Fa-f]+)>|\((?:[^()\\]|\\.)*\)', payload):
        if m.group(1):
            h=m.group(1); off=OFF.get(font,29)
            for i in range(0,len(h)-3,4):
                c=int(h[i:i+4],16)+off
                out.append(chr(c) if 32<=c<0x2200 else '?')
        else:
            raw=m.group(0)[1:-1].replace('\\(','(').replace('\\)',')').replace('\\','')
            out.append(raw)
    return ''.join(out)

runs=[]
for idx,s in enumerate(streams):
    t=s.decode('latin-1')
    if '/P<' not in t and 'Tf' not in t: continue
    cur=None; x=y=0.0; scale=None
    pat=re.compile(r'/([A-Za-z0-9-]+)\s+([\d.]+)\s+Tf|1 0 0 1 ([\d.-]+) ([\d.-]+) Tm|(-?[\d.]+)\s+(-?[\d.]+)\s+TD|\[((?:<[0-9A-Fa-f]+>|\((?:[^()\\]|\\.)*\)|-?[\d.]+|\s)+)\]\s*TJ|<([0-9A-Fa-f]+)>\s*Tj|\(((?:[^()\\]|\\.)*)\)\s*Tj')
    for m in pat.finditer(t):
        if m.group(1): cur=(m.group(1), float(m.group(2)))
        elif m.group(3) is not None: x=float(m.group(3)); y=float(m.group(4))
        elif m.group(5) is not None: x+=float(m.group(5)); y+=float(m.group(6))
        else:
            payload=m.group(7) or ('<'+m.group(8)+'>' if m.group(8) else '('+(m.group(9) or '')+')')
            txt=dec(cur[0] if cur else '', payload)
            if txt.strip(): runs.append((idx,round(y,1),round(x,1),cur,txt))

# cluster by (stream, y) tolerance 3
by = collections.defaultdict(list)
for idx,y,x,f,txt in runs:
    key=None
    for k in by:
        if k[0]==idx and abs(k[1]-y)<=3.5: key=k; break
    if key is None: key=(idx,y); 
    by[key].append((x,txt,f))
res=[]
for k in sorted(by, key=lambda k:(k[0], -k[1])):
    segs=sorted(by[k])
    line=''.join(t for _,t,_ in segs)
    x0=segs[0][0]; fonts=sorted(set(f[0] for _,_,f in segs if f))
    res.append(f'{k[1]:8.1f} x0={x0:7.1f} {"|".join(fonts):28s} {line}')
open(r'E:\portfolio\.tmp_page.txt','w',encoding='utf-8').write('\n'.join(res))
print('lines:',len(res))
print('\n'.join(res))

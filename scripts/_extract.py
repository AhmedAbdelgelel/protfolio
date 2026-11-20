
import re, zlib, sys
data = open(r'E:\AhmedAbdelgelel.pdf','rb').read()
print('bytes', len(data))
print('header', data[:20])
streams = []
for m in re.finditer(rb'stream\r?\n', data):
    start = m.end()
    end = data.find(b'endstream', start)
    if end == -1: continue
    raw = data[start:end]
    try:
        dec = zlib.decompress(raw)
        streams.append(dec)
    except Exception:
        pass
print('streams decompressed:', len(streams))
texts=[]
for s in streams:
    if b'Tj' in s or b'TJ' in s:
        texts.append(s)
print('content streams:', len(texts))
out=[]
for s in texts:
    t = s.decode('latin-1')
    # collect text show operators
    for m in re.finditer(r'\((?:\\.|[^\\()])*\)|<([0-9A-Fa-f]+)>|\bTd\b|\bTD\b|\bT\*\b|\bTJ\b|\bTj\b|\bET\b', t):
    # simplistic
        pass
    out.append(t)
open(r'E:\portfolio\.tmp_content.txt','w',encoding='utf-8').write('\n\n=====\n\n'.join(out))
print('wrote', sum(len(x) for x in out))

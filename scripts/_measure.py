
import os, shutil
from PIL import Image
srcs = [r'C:\Users\user\.dsh\attachments\v1\objects\5e\5e92bcbd980b026bd7434d6bc439c1eb8f30c6d10cceacadbbdb787bfa05e9f9',
        r'C:\Users\user\.dsh\attachments\v1\objects\d7\d7fe54cd429169411aa3f8fd8c11efe59665e6c165d769127d750e4dd8a9853b']
os.makedirs(r'E:\portfolio\.tmp', exist_ok=True)
for i,s in enumerate(srcs,1):
    shutil.copyfile(s, rf'E:\portfolio\.tmp\orig_p{i}.png')
im = Image.open(r'E:\portfolio\.tmp\orig_p1.png').convert('RGB')
W,H = im.size
print('size', W, H, 'dpi-x', W/8.5)
px = im.load()
# find dark rows (rules) : rows where >40% of pixels dark
dark_rows=[]
for y in range(H):
    c=sum(1 for x in range(W) if sum(px[x,y])<300)
    if c> W*0.35: dark_rows.append((y,c))
print('dark rows:', dark_rows[:40])
# row extents for the first rule
if dark_rows:
    y0=dark_rows[0][0]
    xs=[x for x in range(W) if sum(px[x,y0])<300]
    print('rule y', y0, 'x from', xs[0], 'to', xs[-1])
# sample color of [GitHub] on page1: approx x 745..815, y 1075 per render view
for (x,y,label) in [(752,1074,'GH1'),(760,1075,'GH2'),(150,1078,'bodytext')]:
    print(label, px[x,y])

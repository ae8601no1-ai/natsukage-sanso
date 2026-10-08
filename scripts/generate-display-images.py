"""Create presentation-only derivatives; preserve every original PNG."""
from pathlib import Path
import re,json,hashlib
from PIL import Image
root=Path(__file__).resolve().parents[1]
source=root/'public/assets/generated';dest=root/'public/assets/display';dest.mkdir(exist_ok=True)
records=[]
def make(path,width,quality,kind):
 im=Image.open(path).convert('RGB');im.thumbnail((width,width*2),Image.Resampling.LANCZOS)
 target=dest/(path.stem+('_display.webp' if kind=='character' else '_thumb.webp'))
 im.save(target,'WEBP',quality=quality,method=6)
 records.append(dict(kind=kind,original=path.relative_to(root).as_posix(),output=target.relative_to(root).as_posix(),before=path.stat().st_size,after=target.stat().st_size,width=im.width,height=im.height,original_sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
for path in sorted(source.glob('character_*.png')):make(path,768,90,'character')
slots=dict(re.findall(r'(\w+): \{ src: "(/assets/generated/[^\"]+)"',(root/'lib/game/assets.ts').read_text()))
evidence=(root/'lib/game/evidence.ts').read_text();ids=set(re.findall(r'image: "([^"]+)"',evidence))
for url in sorted({slots[id] for id in ids}):make(root/('public'+url),640,88,'archive')
# Pixel-exact lossless night exterior; no evidence detail is discarded.
p=source/'lodge_blackout_2310.png';im=Image.open(p);target=dest/'lodge_blackout_2310_lossless.webp';im.save(target,'WEBP',lossless=True,method=6)
assert Image.open(target).convert('RGBA').tobytes()==im.convert('RGBA').tobytes()
records.append(dict(kind='background_lossless',original=p.relative_to(root).as_posix(),output=target.relative_to(root).as_posix(),before=p.stat().st_size,after=target.stat().st_size,width=im.width,height=im.height,original_sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
report=root/'reports/bandwidth-optimization';report.mkdir(parents=True,exist_ok=True);(report/'images.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
for kind in ['character','archive','background_lossless']:
 rs=[r for r in records if r['kind']==kind];a=sum(r['before'] for r in rs);b=sum(r['after'] for r in rs);print(kind,len(rs),a,b,round(100*(1-b/a),2))

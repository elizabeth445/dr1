from PIL import Image, ImageDraw
from pathlib import Path
root=Path('output/qa')
for section in ['opening','hero','invitation','moments','details','evening','wish','rsvp','closing']:
    for group,widths in [('mobile',[320,375,390,430]),('wide',[768,1024,1440,1920])]:
        images=[]
        for width in widths:
            p=root/f'{section}-{width}.png'
            if p.exists():
                im=Image.open(p).convert('RGB'); im.thumbnail((380,900));images.append((width,im))
        if not images:continue
        board=Image.new('RGB',(sum(im.width for _,im in images),max(im.height for _,im in images)+28),'#ded6ca')
        x=0;d=ImageDraw.Draw(board)
        for width,im in images:
            d.text((x+8,8),f'{section} / {width}px',fill='#302522');board.paste(im,(x,28));x+=im.width
        board.save(root/f'board-{section}-{group}.jpg',quality=90)

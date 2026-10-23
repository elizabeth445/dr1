"""Validate actual TTF glyph maps for the full Ukrainian alphabet, no dependencies."""
from pathlib import Path
import json, struct
alphabet = 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯабвгґдеєжзиіїйклмнопрстуфхцчшщьюя’'
for name in ['unbounded-black.ttf','plex-sans.ttf','plex-sans-semibold.ttf','plex-mono.ttf']:
    path = Path('assets/font-sources') / name
    b = path.read_bytes()
    u16 = lambda p: struct.unpack_from('>H', b, p)[0]
    u32 = lambda p: struct.unpack_from('>I', b, p)[0]
    tables = {b[12 + i*16:16 + i*16].decode(): u32(20 + i*16) for i in range(u16(4))}
    base = tables['cmap']; codes = set()
    for i in range(u16(base+2)):
        offset = base + u32(base+8+i*8)
        fmt = u16(offset)
        if fmt == 4:
            count = u16(offset+6)//2
            for j in range(count):
                end = u16(offset+14+j*2); start = u16(offset+16+count*2+j*2)
                delta = u16(offset+16+count*4+j*2)
                rpos = offset+16+count*6+j*2; roff = u16(rpos)
                for cp in range(start,end+1):
                    glyph = u16(rpos+roff+2*(cp-start)) if roff else (cp+delta)%65536
                    if glyph: codes.add(cp)
        elif fmt == 12:
            for j in range(u32(offset+12)):
                start,end,_ = struct.unpack_from('>III',b,offset+16+j*12)
                codes.update(range(start,end+1))
    missing = [c for c in alphabet if ord(c) not in codes]
    assert not missing, f'{path}: missing {missing}'
    print(f'{path.name}: Ukrainian alphabet + apostrophe OK')

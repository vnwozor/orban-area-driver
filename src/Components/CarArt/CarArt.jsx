import React, { useId } from 'react'

// Simple car illustrations, one per car type. Used whenever a driver hasn't
// uploaded a photo of their car.
const SHAPES = {
  Sedan: { body: 'M20 98 Q20 84 40 80 L78 74 Q96 44 130 40 L200 40 Q232 42 250 72 L288 80 Q302 84 302 98 L302 108 Q302 114 296 114 L26 114 Q20 114 20 108 Z', win: ['M100 72 Q112 50 134 48 L156 48 L156 72 Z', 'M166 48 L198 48 Q220 50 232 72 L166 72 Z'], wx: [82, 244] },
  SUV: { body: 'M20 98 Q20 82 38 78 L60 74 L74 46 Q78 38 90 38 L226 38 Q240 38 246 48 L268 76 L288 80 Q302 84 302 98 L302 108 Q302 114 296 114 L26 114 Q20 114 20 108 Z', win: ['M86 72 L96 48 L150 48 L150 72 Z', 'M160 48 L226 48 L242 72 L160 72 Z'], wx: [82, 244] },
  Compact: { body: 'M30 100 Q30 86 48 82 L84 76 Q100 48 132 44 L188 44 Q216 46 232 74 L270 82 Q290 86 290 100 L290 108 Q290 114 284 114 L36 114 Q30 114 30 108 Z', win: ['M104 74 Q114 54 136 52 L152 52 L152 74 Z', 'M162 52 L186 52 Q206 54 218 74 L162 74 Z'], wx: [86, 236] },
  Van: { body: 'M16 98 Q16 40 40 34 L250 34 Q276 36 290 68 L304 84 Q310 90 310 100 L310 108 Q310 114 304 114 L22 114 Q16 114 16 108 Z', win: ['M36 46 L92 46 L92 76 L36 76 Z', 'M102 46 L158 46 L158 76 L102 76 Z', 'M168 46 L224 46 L224 76 L168 76 Z', 'M234 46 L252 46 Q268 48 278 70 L278 76 L234 76 Z'], wx: [78, 250] }
};

export const CarArt = ({ type = 'Sedan', color = '#3B4A66', photo = null, alt }) => {
    const gid = useId().replace(/:/g, '')
    if (photo) return <img className='photo' src={photo} alt={alt || 'Car'} />
    const s = SHAPES[type] || SHAPES.Sedan
    return (
        <svg viewBox='0 0 320 150' role='img' aria-label={alt || `${type} car illustration`}>
            <defs>
                <linearGradient id={gid} x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0' stopColor='#fff' stopOpacity='.28' />
                    <stop offset='.5' stopColor='#fff' stopOpacity='0' />
                    <stop offset='1' stopColor='#000' stopOpacity='.22' />
                </linearGradient>
            </defs>
            <ellipse cx='160' cy='138' rx='132' ry='8' fill='#000' opacity='.14' />
            <path d={s.body} fill={color} />
            <path d={s.body} fill={`url(#${gid})`} />
            {s.win.map((w) => (
                <path key={w} d={w} fill='#DCE8F5' opacity='.92' />
            ))}
            <circle cx='294' cy='94' r='4' fill='#FFD27A' />
            <rect x='24' y='92' width='6' height='8' rx='2' fill='#E5484D' />
            {s.wx.map((x) => (
                <g key={x}>
                    <circle cx={x} cy='114' r='22' fill='#141A26' />
                    <circle cx={x} cy='114' r='10' fill='#C7D0DB' />
                </g>
            ))}
        </svg>
    )
}

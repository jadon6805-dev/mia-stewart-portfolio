import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'

gsap.registerPlugin(ScrollTrigger)

/* ─── grain SVG filter ─── */
const GRAIN = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
  <filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/>
  <feColorMatrix type='saturate' values='0'/></filter>
  <rect width='300' height='300' filter='url(%23g)' opacity='1'/>
</svg>`
const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(GRAIN)}")`

/* ─── scramble text util ─── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
function scramble(el, final, duration = 1000) {
  let start = null
  const tick = ts => {
    if (!start) start = ts
    const prog = Math.min((ts - start) / duration, 1)
    const revealedCount = Math.floor(prog * final.length)
    el.textContent = final.split('').map((ch, i) =>
      i < revealedCount ? ch : (ch === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)])
    ).join('')
    if (prog < 1) requestAnimationFrame(tick)
    else el.textContent = final
  }
  requestAnimationFrame(tick)
}

const ACCENT = '#4274D9'
const ACCENT_A = (a) => `rgba(66,116,217,${a})`
const CREAM = '#D0E7E6'
const MUTED = '#95CCDD'
const SURF1 = '#111e47'
const SURF2 = '#293681'
const BORDER = `rgba(149,204,221,0.1)`

export default function App() {
  const cursorRef        = useRef(null)
  const ringRef          = useRef(null)
  const navRef           = useRef(null)
  const name1Ref         = useRef(null)
  const name2Ref         = useRef(null)
  const logoRef          = useRef(null)
  const copyrightRef     = useRef(null)
  const quoteRef         = useRef(null)
  const logoClickCount   = useRef(0)
  const copyClickCount   = useRef(0)

  useEffect(() => {
    /* ── cursor ── */
    const cur = cursorRef.current, rng = ringRef.current
    let mx=0,my=0,rx=0,ry=0,raf

    const updateCursorColor = () => {
      const els = document.elementsFromPoint(mx, my)
      const el = els.find(e =>
        e !== document.body &&
        e !== document.documentElement &&
        e.textContent.trim().length > 0 &&
        getComputedStyle(e).pointerEvents !== 'none'
      ) || els[0]
      if (el) {
        const c = getComputedStyle(el).color
        const rgba = c.replace('rgb(','rgba(').replace(')',',0.6)')
        gsap.to(cur, { background: c, duration: 0.2 })
        gsap.to(rng, { borderColor: rgba, duration: 0.2 })
      }
    }

    const onMove = e => {
      mx=e.clientX; my=e.clientY
      gsap.set(cur, { x:mx, y:my })
      updateCursorColor()
      const overLink = !!e.target.closest('#contact a')
      gsap.to(cur, { scale: overLink ? 3 : 1, duration: .2 })
      gsap.to(rng, { scale: overLink ? 1.8 : 1, opacity: overLink ? .6 : 1, duration: .2 })
    }
    document.addEventListener('mousemove', onMove)
    const follow = () => {
      rx+=(mx-rx)*.1; ry+=(my-ry)*.1
      gsap.set(rng, { x:rx, y:ry })
      raf = requestAnimationFrame(follow)
    }
    follow()

    /* ── helpers for easter eggs ── */
    const eggToast = (msg) => {
      const el = document.createElement('div')
      el.innerText = msg
      el.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        background:rgba(17,30,71,0.97);color:${CREAM};padding:20px 44px;border-radius:14px;
        font-family:'Space Mono',monospace;font-size:1rem;letter-spacing:0.18em;text-transform:uppercase;
        z-index:99999;pointer-events:none;border:1px solid ${ACCENT};white-space:nowrap;`
      document.body.appendChild(el)
      gsap.fromTo(el, { opacity:0, scale:0.85 }, { opacity:1, scale:1, duration:0.35 })
      setTimeout(() => gsap.to(el, { opacity:0, scale:0.9, duration:0.4, onComplete:() => el.remove() }), 2200)
    }

    const soccerRain = () => {
      for (let i = 0; i < 18; i++) {
        setTimeout(() => {
          const b = document.createElement('div')
          b.style.cssText = `position:fixed;width:18px;height:18px;border-radius:50%;
            background:${ACCENT};border:2px solid ${CREAM};left:${Math.random()*96+2}vw;
            top:-30px;z-index:9999;pointer-events:none;`
          document.body.appendChild(b)
          gsap.to(b, { y: window.innerHeight + 60, x:(Math.random()-.5)*180,
            rotation:360*(Math.random()>.5?1:-1), opacity:0, duration:1.4+Math.random()*.8,
            ease:'power2.in', onComplete:()=>b.remove() })
        }, i * 70)
      }
    }

    const faithBurst = () => {
      const orb = document.createElement('div')
      orb.style.cssText = `position:fixed;width:10px;height:10px;border-radius:50%;
        background:radial-gradient(circle,${CREAM} 0%,${ACCENT} 40%,transparent 70%);
        left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999;pointer-events:none;`
      document.body.appendChild(orb)
      gsap.to(orb, { width:'140vmax', height:'140vmax', opacity:0, duration:1.6,
        ease:'power2.out', onComplete:()=>orb.remove() })
    }

    /* ── easter egg 1: type "MIA" → hero flash + name rescramble ── */
    /* ── easter egg 2: type "SOCCER" → balls rain ── */
    /* ── easter egg 3: type "FAITH" → light burst ── */
    let typed = ''
    document.addEventListener('keypress', e => {
      typed += e.key.toUpperCase()
      if (typed.length > 6) typed = typed.slice(-6)
      if (typed.endsWith('MIA')) {
        typed = ''
        gsap.timeline()
          .to('#hero', { background: ACCENT, duration: 0.3 })
          .to('#hero', { background: '#07070f', duration: 1.8, ease: 'power2.out' })
        if (name1Ref.current) scramble(name1Ref.current, 'MIA', 700)
        if (name2Ref.current) setTimeout(() => scramble(name2Ref.current, 'STEWART', 800), 100)
      } else if (typed.endsWith('SOCCER')) {
        typed = ''
        soccerRain()
        eggToast('GOOOAL!')
      } else if (typed.endsWith('FAITH')) {
        typed = ''
        faithBurst()
        eggToast('FAITH FIRST.')
      } else if (typed.endsWith('KIWI')) {
        typed = ''
        gsap.timeline()
          .to('#hero', { background: MUTED, duration: 0.25 })
          .to('#hero', { background: '#07070f', duration: 1.5, ease: 'power2.out' })
        eggToast('KIA ORA FROM HASTINGS!')
      } else if (typed.endsWith('GUITAR')) {
        typed = ''
        guitarEffect()
        eggToast('STRUM IT.')
      } else if (typed.endsWith('30')) {
        typed = ''
        jerseyEffect()
      }
    })

    /* ── easter egg 4: konami code → secret message ── */
    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
    let konamiIdx = 0
    document.addEventListener('keydown', e => {
      if (e.key === KONAMI[konamiIdx]) {
        konamiIdx++
        if (konamiIdx === KONAMI.length) {
          konamiIdx = 0
          eggToast('CHEAT CODE ACTIVATED')
          gsap.to('body', { filter:'invert(1)', duration:0.15, yoyo:true, repeat:5,
            onComplete:() => gsap.set('body', { filter:'none' }) })
        }
      } else {
        konamiIdx = e.key === KONAMI[0] ? 1 : 0
      }
    })

    /* ── easter egg 5: triple-click MS. logo → spin ── */
    const logoEl = logoRef.current
    if (logoEl) {
      logoEl.style.cursor = 'pointer'
      logoEl.addEventListener('click', () => {
        logoClickCount.current++
        if (logoClickCount.current >= 3) {
          logoClickCount.current = 0
          gsap.fromTo(logoEl, { rotation:0 }, { rotation:360, duration:0.7, ease:'back.out(1.7)' })
        }
      })
    }

    /* ── easter egg 6: click copyright 5× → hidden message ── */
    const copyEl = copyrightRef.current
    if (copyEl) {
      copyEl.style.cursor = 'pointer'
      copyEl.addEventListener('click', () => {
        copyClickCount.current++
        if (copyClickCount.current >= 5) {
          copyClickCount.current = 0
          const orig = copyEl.innerText
          copyEl.innerText = 'Built with love in NZ'
          gsap.fromTo(copyEl, { color: MUTED }, { color: CREAM, duration:0.4 })
          setTimeout(() => {
            gsap.to(copyEl, { color: MUTED, duration:0.5,
              onComplete:() => { copyEl.innerText = orig } })
          }, 2400)
        }
      })
    }

    /* ── easter egg 7: type "KIWI" → Kia Ora toast + teal flash ── */
    /* ── easter egg 8: type "GUITAR" → music notes float up ── */
    /* ── easter egg 9: type "30" → giant jersey number ── */
    /* handled in the keypress listener above — extend buffer to 8 */

    const guitarEffect = () => {
      const notes = ['♩','♪','♫','♬']
      for (let i = 0; i < 14; i++) {
        setTimeout(() => {
          const n = document.createElement('div')
          n.innerText = notes[Math.floor(Math.random() * notes.length)]
          n.style.cssText = `position:fixed;bottom:${10+Math.random()*20}%;left:${5+Math.random()*88}%;
            font-size:${1.4+Math.random()*1.4}rem;color:${MUTED};z-index:9999;pointer-events:none;
            font-family:'Nunito',sans-serif;user-select:none;`
          document.body.appendChild(n)
          gsap.to(n, { y:-(180+Math.random()*280), x:(Math.random()-.5)*80, opacity:0,
            duration:1.8+Math.random()*.8, ease:'power1.out', onComplete:()=>n.remove() })
        }, i * 90)
      }
    }

    const jerseyEffect = () => {
      const el = document.createElement('div')
      el.innerText = '#30'
      el.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        font-family:'Bebas Neue',cursive,sans-serif;font-size:28vw;color:${ACCENT};opacity:0;
        z-index:9999;pointer-events:none;letter-spacing:0.02em;`
      document.body.appendChild(el)
      gsap.to(el, { opacity:0.18, duration:0.35, yoyo:true, repeat:1,
        onComplete:()=>el.remove() })
    }

    /* ── easter egg 10: double-click the quote → scramble + restore ── */
    const quoteEl = quoteRef.current
    const quoteText = '"Faith first. People Always. Everything else will figure itself out."'
    if (quoteEl) {
      quoteEl.addEventListener('dblclick', () => {
        scramble(quoteEl, quoteText, 900)
      })
    }

    /* ── right-click any image → block + "Nice try!" ── */
    const onImgContext = e => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault()
        eggToast('Nice try!')
      }
    }
    document.addEventListener('contextmenu', onImgContext)

    /* ── easter egg 12: hold Space for 2s → warp speed dots ── */
    let spaceTimer = null
    const onSpaceDown = e => {
      if (e.code !== 'Space' || e.target.tagName === 'INPUT') return
      if (spaceTimer) return
      spaceTimer = setTimeout(() => {
        for (let i = 0; i < 40; i++) {
          setTimeout(() => {
            const dot = document.createElement('div')
            const angle = Math.random() * Math.PI * 2
            const dist = 60 + Math.random() * 40
            dot.style.cssText = `position:fixed;width:3px;height:${8+Math.random()*16}px;
              background:${Math.random()>.5?ACCENT:MUTED};border-radius:2px;opacity:1;
              left:50%;top:50%;transform-origin:center;z-index:9999;pointer-events:none;`
            document.body.appendChild(dot)
            gsap.fromTo(dot,
              { x:0, y:0, opacity:1 },
              { x: Math.cos(angle)*(window.innerWidth*.6), y: Math.sin(angle)*(window.innerHeight*.6),
                opacity:0, duration:.9+Math.random()*.5, ease:'power2.in', onComplete:()=>dot.remove() }
            )
          }, i * 20)
        }
        eggToast('WARP SPEED')
      }, 2000)
    }
    const onSpaceUp = e => {
      if (e.code !== 'Space') return
      clearTimeout(spaceTimer)
      spaceTimer = null
    }
    document.addEventListener('keydown', onSpaceDown)
    document.addEventListener('keyup', onSpaceUp)

    /* ── nav ── */
    const nav = navRef.current
    const onScroll = () => {
      const scrolled = window.scrollY > 80
      if (nav) {
        nav.style.padding         = scrolled ? '12px 48px' : '22px 48px'
        nav.style.background      = scrolled ? 'rgba(41,54,129,0.2)' : 'rgba(41,54,129,0.04)'
        nav.style.backdropFilter  = 'blur(20px) saturate(1.4)'
        nav.style.borderBottomColor = scrolled ? 'rgba(149,204,221,0.22)' : 'rgba(149,204,221,0.15)'
      }
      updateCursorColor()
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    /* ── scroll progress bar ── */
    const progressBar = document.createElement('div')
    progressBar.style.cssText = `position:fixed;top:0;left:0;height:2px;width:0%;background:linear-gradient(90deg,${ACCENT},${MUTED});z-index:9999;pointer-events:none;transition:width .1s linear;`
    document.body.appendChild(progressBar)
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      progressBar.style.width = `${(window.scrollY / total) * 100}%`
    }

    /* ── hero name scramble on load ── */
    setTimeout(() => {
      if (name1Ref.current) scramble(name1Ref.current, 'MIA', 900)
      if (name2Ref.current) setTimeout(() => scramble(name2Ref.current, 'STEWART', 900), 180)
    }, 200)

    /* ── hero entrance ── */
    gsap.timeline({ delay: 0.1 })
      .fromTo('.hero-eyebrow', { opacity:0, y:20 }, { opacity:1, y:0, duration:.6, ease:'power3.out' })
      .fromTo('.hero-name',    { opacity:0, y:60 }, { opacity:1, y:0, duration:.9, stagger:.12, ease:'power4.out' }, '-=.3')
      .fromTo('.hero-meta',    { opacity:0, y:20 }, { opacity:1, y:0, duration:.6, ease:'power3.out' }, '-=.3')
      .fromTo('.hero-scroll',  { opacity:0 },       { opacity:1, duration:.5 }, '-=.2')

    /* ── nav links stagger in ── */
    gsap.fromTo('nav li',
      { opacity:0, y:-10 },
      { opacity:1, y:0, duration:.5, stagger:.07, delay:.6, ease:'power2.out' }
    )

    /* ── hero glow orb drifts with mouse ── */
    const heroGlow = document.querySelector('.hero-glow')
    const onMouseMoveHero = e => {
      if (!heroGlow) return
      const cx = (e.clientX / window.innerWidth  - 0.5) * 60
      const cy = (e.clientY / window.innerHeight - 0.5) * 40
      gsap.to(heroGlow, { x: cx, y: cy, duration:1.8, ease:'power1.out' })
    }
    document.addEventListener('mousemove', onMouseMoveHero)

    /* ── pop-out sections ── */
    gsap.utils.toArray('.popout').forEach(section => {
      gsap.fromTo(section,
        { clipPath: 'inset(0px 2vw 0px 2vw round 1rem)' },
        { clipPath: 'inset(0px 0px 0px 0px round 0px)', ease:'none',
          scrollTrigger: { trigger:section, start:'top 90%', end:'top 2%', scrub:2 } }
      )
    })

    /* ── hero gently recedes ── */
    gsap.to('#hero', {
      scale: 0.95, ease: 'none',
      scrollTrigger: { trigger:'#about', start:'top 85%', end:'top 30%', scrub:2 }
    })

    /* ── reveals ── */
    gsap.utils.toArray('.reveal').forEach((el, i) => {
      gsap.fromTo(el,
        { opacity:0, y:40 },
        { opacity:1, y:0, duration:.8, ease:'power3.out', delay:(i%4)*.08,
          scrollTrigger: { trigger:el, start:'top 88%', toggleActions:'play none none none' } }
      )
    })

    /* ── section headings drift in from left ── */
    gsap.utils.toArray('.sec-heading').forEach(el => {
      gsap.fromTo(el,
        { opacity:0, x:-30 },
        { opacity:1, x:0, duration:1, ease:'power3.out',
          scrollTrigger: { trigger:el, start:'top 88%', toggleActions:'play none none none' } }
      )
    })

    /* ── skill rows alternate slide ── */
    gsap.utils.toArray('.skill-row').forEach((el, i) => {
      gsap.fromTo(el,
        { opacity:0, x: i%2===0 ? -20 : 20 },
        { opacity:1, x:0, duration:0.6, ease:'power2.out', delay: i * 0.05,
          scrollTrigger: { trigger:el, start:'top 90%', toggleActions:'play none none none' } }
      )
    })

    /* ── gallery parallax ── */
    gsap.utils.toArray('.g-item').forEach((item, i) => {
      gsap.to(item, {
        y: i % 2 === 0 ? -30 : -15, ease:'none',
        scrollTrigger: { trigger:item, start:'top bottom', end:'bottom top', scrub:2 }
      })
    })

    /* ── stat count-up ── */
    document.querySelectorAll('.stat-count').forEach(el => {
      const target = el.dataset.target
      const isNum = /^\d+$/.test(target)
      if (!isNum) return
      ScrollTrigger.create({
        trigger: el, start:'top 85%', once:true,
        onEnter: () => {
          let n = 0
          const end = parseInt(target)
          const step = () => { n++; el.textContent = n; if (n < end) setTimeout(step, 60) }
          step()
        }
      })
    })

    /* ── ghost text in contact drifts on scroll ── */
    gsap.to('.contact-ghost', {
      y: -40, ease:'none',
      scrollTrigger: { trigger:'#contact', start:'top bottom', end:'bottom top', scrub:1.5 }
    })

    /* ── eyebrow lines draw in ── */
    gsap.utils.toArray('.draw-line').forEach(el => {
      gsap.fromTo(el,
        { scaleX:0 },
        { scaleX:1, duration:0.7, ease:'power2.inOut', transformOrigin:'left',
          scrollTrigger: { trigger:el, start:'top 90%', toggleActions:'play none none none' } }
      )
    })

    window.addEventListener('scroll', updateProgress, { passive: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousemove', onMouseMoveHero)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', updateProgress)
      progressBar.remove()
      cancelAnimationFrame(raf)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  /* ── 3D card tilt ── */
  const tilt = (e, el) => {
    const r = el.getBoundingClientRect()
    gsap.to(el, {
      rotateX: (e.clientY-r.top-r.height/2)/r.height*-10,
      rotateY: (e.clientX-r.left-r.width/2)/r.width*10,
      transformPerspective: 800, duration: .3, ease: 'power2.out',
    })
  }
  const untilt = el => gsap.to(el, { rotateX:0, rotateY:0, duration:.5, ease:'power2.out' })

  const navLinks = [['About','#about'],['Skills','#skills'],['Experience','#experience'],['Gallery','#gallery'],['Contact','#contact']]

  const skills = [
    'Hard Working', 'Soccer',
    'Communication', 'Cooking',
    'Creative Writing', 'Guitar',
    'Encouragement', 'Youth Ministry',
  ]

  const experience = [
    { num:'01', period:'Oct 2025 — Present', role:'Shelf Stacker', company:'New World', numCol: MUTED,
      desc:'Keeping shelves stocked and organised in a busy supermarket environment. Shows up, works hard, and gets the job done — every shift.' },
  ]

  const [lightbox, setLightbox] = useState(null)

  const gallery = [
    { cap:'Sunset View', img:'/sunset-view.jpg', grad:`linear-gradient(135deg,#293681,#111e47)`, glow:`rgba(66,116,217,0.6)`,  col:'1/3', row:'1/2' },
    { cap:'Focused Play', img:'/focused-play.jpg', grad:`linear-gradient(135deg,#0d2040,#0a1230)`, glow:`rgba(149,204,221,0.6)`, col:'3/4', row:'1/3' },
    { cap:'Ready Up', img:'/ready-up.jpg', grad:`linear-gradient(135deg,#1a3a6b,#293681)`, glow:`rgba(208,231,230,0.5)`, col:'1/2', row:'2/4' },
    { cap:'Golden Hour', img:'/golden-hour.jpg', grad:`linear-gradient(135deg,#0a1e3a,#0a1230)`, glow:`rgba(66,116,217,0.5)`,  col:'2/3', row:'2/3' },
    { cap:'Wild Nature', img:'/wild-nature.jpg', grad:`linear-gradient(135deg,#293681,#0d2040)`, glow:`rgba(149,204,221,0.5)`, col:'2/4', row:'3/4' },
  ]

  const slideImages = useMemo(() => {
    const imgs = gallery.filter(g => g.img).map(g => g.img)
    return [...imgs].sort(() => Math.random() - 0.5)
  }, [])
  const [slideIdx, setSlideIdx]         = useState(0)
  const [slideVisible, setSlideVisible] = useState(true)

  useEffect(() => {
    if (slideImages.length < 2) return
    let t1, t2, t3
    const cycle = () => {
      t1 = setTimeout(() => {
        setSlideVisible(false)
        t2 = setTimeout(() => {
          setSlideIdx(i => (i + 1) % slideImages.length)
          setSlideVisible(true)
          t3 = setTimeout(cycle, 1200)
        }, 1200)
      }, 8000)
    }
    cycle()
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [slideImages.length])

  useEffect(() => {
    if (lightbox === null) return
    const onKey = e => {
      if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % gallery.length)
      if (e.key === 'ArrowLeft')  setLightbox(i => (i + gallery.length - 1) % gallery.length)
      if (e.key === 'Escape')     setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const eyebrowStyle = {
    fontFamily:"'Space Mono',monospace",
    fontSize:'0.68rem', letterSpacing:'0.22em', textTransform:'uppercase',
    color: MUTED, display:'flex', alignItems:'center', gap:12,
  }
  const line = { display:'block', width:24, height:1, background: MUTED }
  const lineAccent = { display:'block', width:24, height:1, background: ACCENT }

  return (
    <>
      {/* ── grain overlay ── */}
      <div style={{
        position:'fixed', inset:0, zIndex:9000, pointerEvents:'none',
        backgroundImage: GRAIN_URL, backgroundRepeat:'repeat', opacity:0.03,
      }}/>

      {/* ── cursor ── */}
      <div ref={cursorRef} style={{
        position:'fixed', top:0, left:0, width:8, height:8,
        background: ACCENT, borderRadius:'50%',
        pointerEvents:'none', zIndex:9999, transform:'translate(-50%,-50%)',
      }}/>
      <div ref={ringRef} style={{
        position:'fixed', top:0, left:0, width:32, height:32,
        border:`1px solid ${ACCENT_A(0.6)}`, borderRadius:'50%',
        pointerEvents:'none', zIndex:9998, transform:'translate(-50%,-50%)',
        transition:'opacity .2s',
      }}/>

      {/* ── nav ── */}
      <nav ref={navRef} style={{
        position:'fixed', top:0, width:'100%', zIndex:100,
        padding:'22px 48px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background:`rgba(41,54,129,0.04)`,
        backdropFilter:'blur(20px) saturate(1.4)',
        WebkitBackdropFilter:'blur(20px) saturate(1.4)',
        borderBottom:`1px solid rgba(149,204,221,0.15)`,
        transition:'all .35s ease',
      }}>
        <a href="#hero" ref={logoRef} style={{
          fontFamily:"'Bebas Neue',cursive,sans-serif", fontSize:'1.6rem',
          background:`linear-gradient(135deg,${CREAM} 0%,${MUTED} 50%,${ACCENT} 100%)`,
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          backgroundClip:'text', color:'transparent',
          textDecoration:'none', letterSpacing:'0.06em',
          display:'inline-block',
        }}>MS.</a>
        <ul style={{ display:'flex', gap:36, listStyle:'none' }}>
          {navLinks.map(([label, href]) => (
            <li key={label}>
              <a href={href} style={{
                fontFamily:"'Space Mono',monospace", color: MUTED,
                textDecoration:'none', fontSize:'0.72rem',
                letterSpacing:'0.12em', textTransform:'uppercase', transition:'color .2s',
              }}
              onMouseEnter={e => e.target.style.color = CREAM}
              onMouseLeave={e => e.target.style.color = MUTED}
              >{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section id="hero" style={{
        minHeight:'100vh', background:'var(--bg)',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'0 48px', position:'relative', overflow:'hidden',
        transformOrigin:'center top',
      }}>
        {/* dot grid */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:`linear-gradient(${ACCENT_A(0.04)} 1px,transparent 1px),linear-gradient(90deg,${ACCENT_A(0.04)} 1px,transparent 1px)`,
          backgroundSize:'48px 48px',
          maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)',
          WebkitMaskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)',
        }}/>
        {/* multi-colour ambient glows */}
        <div className="hero-glow" style={{
          position:'absolute', top:'35%', left:'35%', transform:'translate(-50%,-50%)',
          width:'600px', height:'300px', pointerEvents:'none',
          background:`radial-gradient(ellipse,${ACCENT_A(0.12)} 0%,transparent 70%)`,
        }}/>
        <div style={{
          position:'absolute', top:'60%', left:'70%', transform:'translate(-50%,-50%)',
          width:'400px', height:'200px', pointerEvents:'none',
          background:`radial-gradient(ellipse,rgba(149,204,221,0.08) 0%,transparent 70%)`,
        }}/>
        <div style={{
          position:'absolute', top:'20%', left:'80%', transform:'translate(-50%,-50%)',
          width:'260px', height:'140px', pointerEvents:'none',
          background:`radial-gradient(ellipse,rgba(41,54,129,0.3) 0%,transparent 70%)`,
        }}/>

        <div className="hero-eyebrow" style={{
          fontFamily:"'Space Mono',monospace",
          fontSize:'0.7rem', letterSpacing:'0.25em', textTransform:'uppercase',
          color: MUTED, marginBottom:24,
          display:'flex', alignItems:'center', gap:16,
        }}>
          <span style={{ display:'block', width:40, height:1, background: MUTED }}/>
          Portfolio · 2026
        </div>

        <h1 style={{ margin:0, lineHeight:1, display:'inline-block', fontSize:'clamp(5rem,20vw,18rem)' }}>
          {/* Row 1: MIA + image fills to STEWART's right edge */}
          <div style={{ display:'flex', alignItems:'flex-end', gap:16 }}>
            <div className="hero-name" style={{
              fontFamily:"'Bebas Neue',cursive,sans-serif",
              fontSize:'clamp(5rem,20vw,18rem)',
              color: CREAM, letterSpacing:'0.02em', lineHeight:1, flexShrink:0,
            }}>
              <span ref={name1Ref} style={{ display:'inline-block' }}>MIA</span>
            </div>
            <div style={{
              flex:1, minWidth:0,
              height:'1em',
              overflow:'hidden',
              borderRadius:16,
              WebkitMaskImage:'linear-gradient(to right, transparent 0%, black 25%, black 70%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
              WebkitMaskComposite:'destination-in',
              maskImage:'linear-gradient(to right, transparent 0%, black 25%, black 70%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
              maskComposite:'intersect',
            }}>
              <img
                src={slideImages[slideIdx]}
                alt="Mia Stewart"
                draggable="false"
                onContextMenu={e => e.preventDefault()}
                style={{
                  width:'100%', height:'100%', objectFit:'cover',
                  objectPosition:'center 30%', display:'block',
                  opacity: slideVisible ? 1 : 0,
                  transition:'opacity 1.2s ease',
                  WebkitUserDrag:'none', userSelect:'none',
                  WebkitTouchCallout:'none',
                }}
              />
            </div>
          </div>
          {/* Row 2: STEWART — defines total block width */}
          <div className="hero-name" style={{
            fontFamily:"'Bebas Neue',cursive,sans-serif",
            fontSize:'clamp(5rem,20vw,18rem)',
            color: ACCENT, letterSpacing:'0.02em', lineHeight:1, display:'block',
          }}>
            <span ref={name2Ref} style={{ display:'inline-block' }}>STEWART</span>
          </div>
        </h1>

        {/* 4-colour palette stripe */}
        <div style={{ display:'flex', gap:0, width:200, height:3, borderRadius:4, overflow:'hidden', margin:'28px 0 4px' }}>
          {['#293681','#4274D9','#95CCDD','#D0E7E6'].map(c => (
            <div key={c} style={{ flex:1, background:c }}/>
          ))}
        </div>

        <div className="hero-meta" style={{
          display:'flex', gap:48, marginTop:12,
          fontFamily:"'Space Mono',monospace",
          fontSize:'0.72rem', letterSpacing:'0.12em', textTransform:'uppercase',
          color: MUTED,
        }}>
          <span style={{ color: MUTED }}>Student · Athlete · Believer</span>
          <span style={{ color:`rgba(149,204,221,0.25)` }}>—</span>
          <span style={{ color: MUTED }}>Hastings, New Zealand</span>
          <span style={{ color:`rgba(149,204,221,0.25)` }}>—</span>
          <span style={{ color: MUTED }}>Available</span>
        </div>

        <div className="hero-scroll" style={{
          position:'absolute', bottom:36, right:48,
          fontFamily:"'Space Mono',monospace",
          fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase',
          color: MUTED, writingMode:'vertical-rl',
          display:'flex', alignItems:'center', gap:12,
        }}>
          Scroll
          <span style={{ display:'block', width:1, height:50, background: MUTED, position:'relative', overflow:'hidden' }}>
            <span style={{
              position:'absolute', top:'-100%', left:0,
              width:'100%', height:'100%', background: ACCENT,
              animation:'runline 2s ease-in-out infinite',
            }}/>
          </span>
        </div>
      </section>

      {/* ════════════ ABOUT ════════════ */}
      <section id="about" className="popout" style={{
        background: SURF1, padding:'80px 64px', willChange:'clip-path', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:'-10%', right:'-5%', width:500, height:500, borderRadius:'50%', pointerEvents:'none',
          background:`radial-gradient(circle, rgba(66,116,217,0.12) 0%, transparent 70%)` }}/>
        <div style={{ position:'absolute', bottom:'-5%', left:'5%', width:350, height:350, borderRadius:'50%', pointerEvents:'none',
          background:`radial-gradient(circle, rgba(149,204,221,0.08) 0%, transparent 70%)` }}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:56, alignItems:'start', position:'relative' }}>

          <div>
            <div className="reveal" style={{ ...eyebrowStyle, marginBottom:32 }}>
              <span style={lineAccent}/> 01 / About
            </div>
            <h2 ref={quoteRef} className="reveal" style={{
              fontFamily:"'Instrument Serif',serif",
              fontSize:'clamp(2.8rem,5vw,4.5rem)',
              color: CREAM, lineHeight:1.1,
              fontWeight:400, fontStyle:'italic', marginBottom:48,
              cursor:'default',
            }}>
              "Faith first. People Always. Everything else will figure itself out."
            </h2>
            <div style={{
              fontFamily:"'Bebas Neue',cursive,sans-serif",
              fontSize:'clamp(3rem,6vw,5rem)',
              color:`rgba(208,231,230,0.06)`,
              letterSpacing:'0.25em', userSelect:'none',
            }}>CREATIVE</div>
          </div>

          <div style={{ paddingTop:80 }}>
            <p className="reveal" style={{
              fontFamily:"'Nunito',sans-serif", color:'rgba(255,255,255,0.45)',
              lineHeight:1.9, fontSize:'1.05rem', marginBottom:24,
            }}>
              Hi, I'm Mia — a student at <span className="bio-key">Hastings Christian School</span>, an avid <span className="bio-key">soccer player</span>,
              and a familiar face at <span className="bio-key">New World</span>. Faith is a massive part of my life; I love spending
              time at <span className="bio-key">youth group</span>, worshipping, and strumming my <span className="bio-key">guitar</span> whenever I get the chance.
            </p>
            <p className="reveal" style={{
              fontFamily:"'Nunito',sans-serif", color:'rgba(255,255,255,0.45)',
              lineHeight:1.9, fontSize:'1.05rem', marginBottom:52,
            }}>
              I'm drawn to deep conversations, creative writing, and coming up with fresh ideas for
              youth messages and Bible studies. Ultimately I just love encouraging people, having fun,
              and growing closer to Jesus every day.
            </p>

            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr', gap:2,
              borderTop:`1px solid ${BORDER}`,
            }}>
              {[['15','Years Old',CREAM],['12','Years of Soccer',CREAM],['∞','Songs Listened To',CREAM],['1','Faith',CREAM]].map(([n,l,col]) => (
                <div key={l} className="reveal stat-card" style={{
                  padding:'28px 0', borderBottom:`1px solid ${BORDER}`,
                  transition:'background .25s, padding .25s', borderRadius:4, cursor:'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `rgba(66,116,217,0.07)`
                  e.currentTarget.style.padding = '28px 12px'
                  e.currentTarget.querySelector('.stat-num').style.transform = 'scale(1.12)'
                  e.currentTarget.querySelector('.stat-num').style.color = MUTED
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.padding = '28px 0'
                  e.currentTarget.querySelector('.stat-num').style.transform = 'scale(1)'
                  e.currentTarget.querySelector('.stat-num').style.color = CREAM
                }}
                >
                  <div className="stat-count stat-num" data-target={n} style={{
                    fontFamily:"'Bebas Neue',cursive,sans-serif",
                    fontSize:'3rem', color: col, lineHeight:1, marginBottom:4,
                    transition:'transform .25s, color .25s', display:'inline-block',
                  }}>{n}</div>
                  <div style={{
                    fontFamily:"'Space Mono',monospace",
                    fontSize:'0.68rem', letterSpacing:'0.1em', textTransform:'uppercase', color: ACCENT,
                  }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ SKILLS ════════════ */}
      <section id="skills" className="popout" style={{
        background: SURF2, padding:'80px 64px', willChange:'clip-path', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:'-15%', right:'10%', width:600, height:600, borderRadius:'50%', pointerEvents:'none',
          background:`radial-gradient(circle, rgba(66,116,217,0.15) 0%, transparent 65%)` }}/>
        <div style={{ position:'absolute', bottom:'-10%', left:'20%', width:400, height:400, borderRadius:'50%', pointerEvents:'none',
          background:`radial-gradient(circle, rgba(149,204,221,0.1) 0%, transparent 65%)` }}/>
        <div className="reveal" style={{ ...eyebrowStyle, marginBottom:64 }}>
          <span style={line}/> 02 / Skills
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:0, borderTop:`1px solid ${BORDER}` }}>
          {skills.map((skill, i) => (
            <div key={skill} className="skill-row" style={{
              borderBottom:`1px solid ${BORDER}`,
              borderRight: i%2===0 ? `1px solid ${BORDER}` : 'none',
              padding:'28px 40px', width:'50%',
              display:'flex', alignItems:'center', gap:20,
              transition:'background .25s', cursor:'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(66,116,217,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{
                fontFamily:"'Bebas Neue',cursive,sans-serif",
                fontSize:'0.85rem', color: i%2===0 ? ACCENT : MUTED, letterSpacing:'0.1em',
                minWidth:24, opacity:0.7,
              }}>{String(i+1).padStart(2,'0')}</span>
              <span style={{
                fontFamily:"'Instrument Serif',serif",
                fontSize:'1.15rem', color: CREAM, fontStyle:'italic',
              }}>{skill}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ EXPERIENCE ════════════ */}
      <section id="experience" className="popout" style={{
        background:'var(--bg)', padding:'80px 64px', willChange:'clip-path', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:'20%', left:'-8%', width:500, height:500, borderRadius:'50%', pointerEvents:'none',
          background:`radial-gradient(circle, rgba(41,54,129,0.35) 0%, transparent 65%)` }}/>
        <div style={{ position:'absolute', bottom:'10%', right:'-5%', width:400, height:400, borderRadius:'50%', pointerEvents:'none',
          background:`radial-gradient(circle, rgba(208,231,230,0.07) 0%, transparent 65%)` }}/>
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'flex-end',
          marginBottom:72, borderBottom:`1px solid ${BORDER}`, paddingBottom:40,
        }}>
          <div className="reveal" style={eyebrowStyle}>
            <span style={lineAccent}/> 03 / Experience
          </div>
          <h2 className="reveal sec-heading" style={{
            fontFamily:"'Instrument Serif',serif",
            fontSize:'clamp(2rem,3.5vw,3rem)',
            color: CREAM, fontWeight:400, fontStyle:'italic',
          }}>Where it all started.</h2>
        </div>

        {experience.map(({ num, period, role, company, desc, numCol }) => (
          <div key={num} className="reveal" style={{
            position:'relative', overflow:'hidden',
            border:`1px solid ${BORDER}`,
            borderRadius:2,
            padding:'64px 72px',
            background:`linear-gradient(135deg, rgba(41,54,129,0.18) 0%, rgba(10,18,48,0.4) 100%)`,
            cursor:'default',
            transition:'border-color .3s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT_A(0.3)}
          onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
          >
            {/* ghost company name */}
            <div style={{
              position:'absolute', bottom:-20, right:40,
              fontFamily:"'Bebas Neue',cursive,sans-serif",
              fontSize:'clamp(5rem,12vw,10rem)',
              color:`rgba(149,204,221,0.04)`,
              letterSpacing:'0.1em', userSelect:'none', lineHeight:1,
              pointerEvents:'none',
            }}>{company}</div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:80, alignItems:'center' }}>
              {/* left */}
              <div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'0.65rem', color: numCol, letterSpacing:'0.2em', marginBottom:20 }}>{num}</div>
                <div style={{
                  fontFamily:"'Bebas Neue',cursive,sans-serif",
                  fontSize:'clamp(2.5rem,5vw,4rem)',
                  color: CREAM, lineHeight:1.05, marginBottom:16,
                  letterSpacing:'0.03em',
                }}>{role}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'0.75rem', color: ACCENT, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>{company}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'0.68rem', color: MUTED, letterSpacing:'0.08em' }}>{period}</div>

                <div style={{ display:'flex', gap:0, width:120, height:2, borderRadius:4, overflow:'hidden', marginTop:32 }}>
                  {['#293681','#4274D9','#95CCDD','#D0E7E6'].map(c => (
                    <div key={c} style={{ flex:1, background:c }}/>
                  ))}
                </div>
              </div>

              {/* right */}
              <div>
                <p style={{
                  fontFamily:"'Nunito',sans-serif", color: MUTED,
                  fontSize:'1.1rem', lineHeight:1.9, marginBottom:40,
                }}>{desc}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                  {['Reliability','Teamwork','Initiative','Customer Service'].map(tag => (
                    <span key={tag} style={{
                      fontFamily:"'Space Mono',monospace",
                      fontSize:'0.62rem', letterSpacing:'0.1em', textTransform:'uppercase',
                      padding:'6px 14px',
                      border:`1px solid ${ACCENT_A(0.3)}`,
                      color: MUTED, borderRadius:2,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ════════════ GALLERY ════════════ */}
      <section id="gallery" className="popout" style={{
        background: SURF1, padding:'80px 64px', willChange:'clip-path',
      }}>
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:60,
        }}>
          <div className="reveal" style={eyebrowStyle}>
            <span style={line}/> 04 / Gallery
          </div>
          <h2 className="reveal sec-heading" style={{
            fontFamily:"'Instrument Serif',serif",
            fontSize:'clamp(2rem,3vw,2.8rem)',
            color: CREAM, fontWeight:400, fontStyle:'italic',
          }}>Moments worth capturing.</h2>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'1fr 1fr 1.4fr',
          gridTemplateRows:'220px 220px 220px',
          gap:12,
        }}>
          {gallery.map(({ cap, img, grad, glow, col, row }, i) => (
            <div key={i} className="reveal g-item" style={{
              gridColumn: col, gridRow: row,
              borderRadius:8, overflow:'hidden',
              position:'relative', background: SURF2, cursor:'pointer',
            }}
            onClick={() => setLightbox(i)}
            onMouseEnter={e => {
              e.currentTarget.querySelector('.cap').style.opacity = '1'
              e.currentTarget.querySelector('.g-grad').style.filter = img ? 'brightness(1.08)' : 'brightness(1.15) saturate(1.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.querySelector('.cap').style.opacity = '0'
              e.currentTarget.querySelector('.g-grad').style.filter = img ? 'brightness(1)' : 'brightness(0.7) saturate(0)'
            }}
            >
              <div className="g-grad" style={{
                position:'absolute', inset:0,
                background: img ? 'none' : grad,
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'filter .6s ease',
                filter: img ? 'brightness(1)' : 'brightness(0.7) saturate(0)',
              }}>
                {img
                  ? <img src={img} alt={cap} draggable="false" onContextMenu={e=>e.preventDefault()} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', WebkitUserDrag:'none', userSelect:'none', WebkitTouchCallout:'none' }}/>
                  : <div style={{ width:120, height:120, borderRadius:'50%', background:`radial-gradient(circle,${glow} 0%,transparent 70%)`, opacity:0.8 }}/>
                }
              </div>
              <div style={{
                position:'absolute', inset:0,
                background:'linear-gradient(to top,rgba(10,18,48,.8) 0%,transparent 50%)',
              }}/>
              <div className="cap" style={{
                position:'absolute', bottom:18, left:20,
                fontFamily:"'Space Mono',monospace",
                fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase',
                color: CREAM, opacity:0, transition:'opacity .3s',
              }}>{cap}</div>
            </div>
          ))}
        </div>
      </section>

      {/* lightbox */}
      {lightbox !== null && (
        <div onClick={() => setLightbox(null)} style={{
          position:'fixed', inset:0, zIndex:10000,
          background:'rgba(10,18,48,0.96)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <button onClick={e => { e.stopPropagation(); setLightbox(i => (i + gallery.length - 1) % gallery.length) }} style={{
            position:'absolute', left:24, top:'50%', transform:'translateY(-50%)',
            background:'none', border:`1px solid ${ACCENT_A(0.3)}`,
            color: CREAM, width:52, height:52, borderRadius:'50%',
            fontSize:'1.4rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'border-color .2s, background .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background=ACCENT_A(0.1); e.currentTarget.style.borderColor=ACCENT_A(0.6) }}
          onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor=ACCENT_A(0.3) }}>←</button>

          <div onClick={e => e.stopPropagation()} style={{
            width:'60vw', maxWidth:700, aspectRatio:'4/3',
            borderRadius:12, overflow:'hidden', position:'relative',
            background: gallery[lightbox].grad,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {gallery[lightbox].img
              ? <img src={gallery[lightbox].img} alt={gallery[lightbox].cap} draggable="false" onContextMenu={e=>e.preventDefault()} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', WebkitUserDrag:'none', userSelect:'none', WebkitTouchCallout:'none' }}/>
              : <div style={{ width:200, height:200, borderRadius:'50%', background:`radial-gradient(circle,${gallery[lightbox].glow} 0%,transparent 70%)` }}/>
            }
            <div style={{
              position:'absolute', bottom:20, left:24,
              fontFamily:"'Space Mono',monospace", fontSize:'0.7rem',
              letterSpacing:'0.15em', textTransform:'uppercase', color: CREAM,
            }}>{gallery[lightbox].cap}</div>
          </div>

          <button onClick={e => { e.stopPropagation(); setLightbox(i => (i + 1) % gallery.length) }} style={{
            position:'absolute', right:24, top:'50%', transform:'translateY(-50%)',
            background:'none', border:`1px solid ${ACCENT_A(0.3)}`,
            color: CREAM, width:52, height:52, borderRadius:'50%',
            fontSize:'1.4rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'border-color .2s, background .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background=ACCENT_A(0.1); e.currentTarget.style.borderColor=ACCENT_A(0.6) }}
          onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor=ACCENT_A(0.3) }}>→</button>

          <button onClick={() => setLightbox(null)} style={{
            position:'absolute', top:24, right:24,
            background:'none', border:'none', color: MUTED,
            fontSize:'1.5rem', cursor:'pointer',
          }}>✕</button>

          <div style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8 }}>
            {gallery.map((_, i) => (
              <div key={i} onClick={e => { e.stopPropagation(); setLightbox(i) }} style={{
                width:6, height:6, borderRadius:'50%', cursor:'pointer',
                background: i === lightbox ? CREAM : ACCENT_A(0.4),
                transition:'background .2s',
              }}/>
            ))}
          </div>
        </div>
      )}

      {/* ════════════ CONTACT ════════════ */}
      <section id="contact" className="popout" style={{
        background: SURF2, padding:'120px 72px',
        willChange:'clip-path', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:600, height:600, borderRadius:'50%', pointerEvents:'none',
          background:`radial-gradient(circle, rgba(66,116,217,0.18) 0%, transparent 65%)` }}/>
        <div style={{ position:'absolute', top:'30%', right:'-5%', width:350, height:350, borderRadius:'50%', pointerEvents:'none',
          background:`radial-gradient(circle, rgba(208,231,230,0.08) 0%, transparent 65%)` }}/>
        {/* ghost text bg */}
        <div className="contact-ghost" style={{
          position:'absolute', bottom:-60, right:-20,
          fontFamily:"'Bebas Neue',cursive,sans-serif",
          fontSize:'clamp(8rem,18vw,16rem)',
          color: ACCENT_A(0.05), lineHeight:1,
          userSelect:'none', pointerEvents:'none', letterSpacing:'0.02em',
        }}>CHAT</div>

        <div style={{ maxWidth:900 }}>
          <div className="reveal" style={{ ...eyebrowStyle, opacity:0.7, marginBottom:48 }}>
            <span style={{ ...line, background: ACCENT_A(0.5) }}/> 05 / Get In Touch
          </div>

          <h2 className="reveal" style={{
            fontFamily:"'Bebas Neue',cursive,sans-serif",
            fontSize:'clamp(3.5rem,10vw,8rem)',
            color: CREAM, lineHeight:0.9, letterSpacing:'0.01em', marginBottom:56,
          }}>
            LET'S<br/>
            <span style={{ color: ACCENT }}>CON</span><span style={{ color: MUTED }}>NECT</span><br/>
            &amp; WORK.
          </h2>

          <a href="mailto:mia@yourdomain.com" className="reveal" style={{
            display:'inline-flex', alignItems:'center', gap:16,
            padding:'18px 40px',
            background:'rgba(208,231,230,0.08)', color: CREAM,
            fontFamily:"'Bebas Neue',cursive,sans-serif",
            fontSize:'1.35rem', letterSpacing:'0.06em',
            textDecoration:'none', borderRadius:100,
            border:`2px solid rgba(208,231,230,0.25)`,
            transition:'transform .2s, background .2s, color .2s, border-color .2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform='translateY(-3px)'
            e.currentTarget.style.background='rgba(149,204,221,0.12)'
            e.currentTarget.style.color=MUTED
            e.currentTarget.style.borderColor='rgba(149,204,221,0.35)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform='none'
            e.currentTarget.style.background='rgba(208,231,230,0.08)'
            e.currentTarget.style.color=CREAM
            e.currentTarget.style.borderColor='rgba(208,231,230,0.25)'
            e.currentTarget.style.boxShadow='none'
          }}
          onMouseDown={e => { e.currentTarget.style.boxShadow=`0 0 24px rgba(149,204,221,0.5), 0 0 48px rgba(66,116,217,0.25)` }}
          onMouseUp={e => { e.currentTarget.style.boxShadow='none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            MIA@YOURDOMAIN.COM
          </a>

          <p className="reveal" style={{
            marginTop:32,
            fontFamily:"'Space Mono',monospace",
            fontSize:'0.72rem', letterSpacing:'0.12em', textTransform:'uppercase',
            color:`rgba(149,204,221,0.5)`,
          }}>Hastings, New Zealand · Open to a conversation</p>
        </div>
      </section>

      {/* ── footer ── */}
      <footer style={{
        padding:'32px 72px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderTop:'none',
        background:'var(--bg)',
        position:'relative',
      }}>
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,#293681,#4274D9,#95CCDD,#D0E7E6)`,
        }}/>
        <div style={{
          fontFamily:"'Bebas Neue',cursive,sans-serif",
          fontSize:'1.35rem', letterSpacing:'0.06em',
          background:`linear-gradient(135deg,${CREAM} 0%,${MUTED} 50%,${ACCENT} 100%)`,
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          backgroundClip:'text', color:'transparent', display:'inline-block',
        }}>MS.</div>
        <div ref={copyrightRef} style={{
          fontFamily:"'Space Mono',monospace",
          fontSize:'0.68rem', letterSpacing:'0.1em', textTransform:'uppercase', color: MUTED,
        }}>© 2026 Mia Stewart</div>
      </footer>

      <style>{`
        .bio-key {
          color: #4274D9;
          font-weight: 600;
          padding: 1px 5px;
          border-radius: 3px;
          border-bottom: 1px solid rgba(66,116,217,0.3);
          transition: color .2s, background .2s, border-color .2s;
          cursor: default;
        }
        .bio-key:hover {
          color: #D0E7E6;
          background: rgba(66,116,217,0.18);
          border-color: rgba(66,116,217,0.55);
        }
        @keyframes runline    { 0%{top:-100%} 100%{top:100%} }
        @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes glowPulse  { 0%,100%{opacity:.05} 50%{opacity:.1} }
        @keyframes shimmer    { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes fadeSlideUp{ 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:none} }

        .stat-card { animation: float 5s ease-in-out infinite; }
        .stat-card:nth-child(2){ animation-delay:.5s }
        .stat-card:nth-child(3){ animation-delay:1s }
        .stat-card:nth-child(4){ animation-delay:1.5s }

        .contact-ghost { animation: glowPulse 4s ease-in-out infinite; }

        .card:hover .card-line { opacity: 1 !important; }
        .card { transition: background .3s, box-shadow .3s; }
        .card:hover { box-shadow: 0 0 0 1px ${ACCENT_A(0.2)}, 0 8px 32px ${ACCENT_A(0.08)} !important; }

        .g-item { transition: box-shadow .3s; }
        .g-item:hover { box-shadow: 0 12px 40px ${ACCENT_A(0.15)}; }

        nav li { opacity:0; }
        nav a { position:relative; }
        nav a::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1px; background:${ACCENT}; transition:width .25s ease; }
        nav a:hover::after { width:100%; }

        .skill-row { transition: background .25s, transform .2s; }
        .skill-row:hover { transform: translateX(6px) !important; }
        .skill-row:hover span:last-child { background: linear-gradient(90deg,${CREAM},${MUTED},${CREAM}); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation: shimmer 2s linear infinite; }

        footer { animation: fadeSlideUp .6s ease both; animation-delay: .2s; }

        @media(max-width:900px){
          nav ul { display:none }
          #about > div { grid-template-columns:1fr !important }
          #experience > div:last-child { grid-template-columns:1fr !important }
          #gallery > div:last-child { grid-template-columns:1fr !important; grid-template-rows:auto !important }
          #gallery .g-item { grid-row:auto !important }
        }
        @media(max-width:600px){
          body { cursor:auto }
          section { padding:80px 24px !important }
          nav { padding:16px 24px !important }
          footer { padding:24px !important }
          .skill-row { width:100% !important; border-right:none !important }
        }
        @media(prefers-reduced-motion:reduce){
          *, *::before, *::after { animation-duration:.01ms !important; transition-duration:.01ms !important }
        }
      `}</style>
    </>
  )
}

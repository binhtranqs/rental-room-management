import {
  ArrowRight,
  BellRing,
  Bot,
  Building2,
  CheckCircle2,
  CreditCard,
  DoorOpen,
  FileSignature,
  Menu,
  MessageSquareText,
  ReceiptText,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4'

type Feature = {
  title: string
  description: string
  icon: LucideIcon
  className: string
}

type WorkflowStep = {
  title: string
  body: string
  icon: LucideIcon
}

type ChatMessage = {
  role: 'assistant' | 'user'
  text: string
}

const features: Feature[] = [
  {
    title: 'Rooms, clearly mapped.',
    description:
      'Availability, maintenance state, price, address, and room history stay visible in one operational view.',
    icon: DoorOpen,
    className: 'bg-[#0a4436] text-white lg:col-span-2 lg:row-span-2',
  },
  {
    title: 'Tenants with context.',
    description:
      'Profiles connect contact details, current room, active agreement, and payment history.',
    icon: Users,
    className: 'bg-white text-[#14231e]',
  },
  {
    title: 'Living contracts.',
    description:
      'Start dates, renewal windows, deposits, and tenant details surface before they become urgent.',
    icon: FileSignature,
    className: 'bg-[#d8efca] text-[#14231e]',
  },
  {
    title: 'Bills that reconcile.',
    description:
      'Rent and utilities inherit the right room and tenant context so follow-up stays clean.',
    icon: ReceiptText,
    className: 'bg-white text-[#14231e]',
  },
  {
    title: 'AI that notices.',
    description:
      'Portfolio signals turn into summaries, reminders, and suggested next actions for owners.',
    icon: Bot,
    className: 'bg-[#f1bd83] text-[#14231e]',
  },
]

const workflowSteps: WorkflowStep[] = [
  {
    title: 'Create room',
    body: 'Set pricing, address, status, and reusable room details once.',
    icon: DoorOpen,
  },
  {
    title: 'Add tenant',
    body: 'Connect a verified tenant profile to an available room.',
    icon: Users,
  },
  {
    title: 'Sign contract',
    body: 'Activate terms, deposit, start date, and renewal reminders.',
    icon: FileSignature,
  },
  {
    title: 'Issue bill',
    body: 'Generate transparent rent and utility records from contract context.',
    icon: ReceiptText,
  },
  {
    title: 'Record payment',
    body: 'Close the loop with a clean payment trail across the portfolio.',
    icon: CreditCard,
  },
]

const aiCards: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: TrendingUp,
    title: 'Insight engine',
    body: 'Flags vacancy, overdue balances, and upcoming renewals.',
  },
  {
    icon: BellRing,
    title: 'Reminder assistant',
    body: 'Drafts clear, context-aware tenant communication.',
  },
]

const aiAnswers: Record<string, string> = {
  'Summarize unpaid bills':
    '7 bills are open, totaling $2,680. Two are overdue; Room B-401 is the highest-priority follow-up.',
  'Draft a gentle reminder':
    'Draft ready: Hi Lan, this is a friendly reminder that the July rent for Room B-401 is still pending. Let me know if you need the payment details again.',
  'What needs attention?':
    'Three actions need attention: two overdue bills, one contract renewing in 12 days, and one vacant room without a listing update.',
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current

    if (!node) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.14 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal-block ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function CinematicHero() {
  return (
    <section
      className="relative min-h-[100dvh] overflow-hidden bg-black text-white"
      aria-label="Rental Room cinematic introduction"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={HERO_VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.28),rgba(0,0,0,.1)_38%,rgba(0,0,0,.76))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(184,255,104,.16),transparent_28rem)]" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-4 pt-4 sm:px-6 md:px-10 lg:px-14">
        <nav
          className="liquid-glass flex items-center justify-between rounded-xl px-4 py-2.5"
          aria-label="Hero navigation"
        >
          <a href="#rental-room" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/12">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">Rental Room</span>
          </a>

          <div className="hidden items-center gap-8 text-sm text-white/76 md:flex">
            <a href="#story" className="transition hover:text-white">
              Overview
            </a>
            <a href="#workflow" className="transition hover:text-white">
              Workflow
            </a>
            <a href="#ai" className="transition hover:text-white">
              AI Assistant
            </a>
          </div>

          <Link
            to="/login"
            className="relative z-10 inline-flex h-12 min-w-[96px] items-center justify-center rounded-full bg-white px-5 text-sm font-bold !text-[#07130f] shadow-sm shadow-black/20 transition hover:bg-[#b8ff68]"
          >
            <span className="relative z-10 text-[#07130f]">Login</span>
          </Link>
        </nav>

        <div className="flex flex-1 flex-col justify-end pb-12 pt-20 lg:pb-16">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <Reveal>
              <h1 className="max-w-5xl text-5xl font-medium leading-none tracking-normal sm:text-6xl md:text-7xl lg:text-8xl">
                Manage every room.
                <br />
                Never miss a payment.
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <div className="max-w-xl lg:justify-self-end">
                <p className="text-base leading-8 text-white/78 md:text-lg">
                  Portfolio-grade rental operations for rooms, tenants, contracts,
                  bills, payments, and AI-powered follow-up.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-3 rounded-full bg-[#b8ff68] px-6 py-3.5 text-sm font-semibold text-[#12382c] transition hover:-translate-y-1"
                  >
                    Continue to login
                    <ArrowRight
                      className="h-4 w-4 transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                  <Link
                    to="/register-owner"
                    className="rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
                  >
                    Create owner account
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function LandingNav() {
  const [open, setOpen] = useState(false)
  const links = [
    ['Preview', '#story'],
    ['Features', '#features'],
    ['Workflow', '#workflow'],
    ['AI assistant', '#ai'],
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-[#1b342b]/10 bg-[#f4efe3]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 md:px-8">
        <a href="#rental-room" className="flex items-center gap-3" aria-label="Rental Room home">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#0b4a3a] text-white shadow-sm shadow-emerald-950/20">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <strong className="block text-[15px] font-semibold tracking-normal">
              Rental Room
            </strong>
            <small className="text-[10px] font-semibold uppercase tracking-normal text-[#6c7872]">
              Property operations
            </small>
          </span>
        </a>

        <nav
          className="hidden items-center gap-8 text-sm font-medium text-[#637069] md:flex"
          aria-label="Product navigation"
        >
          {links.map(([label, href]) => (
            <a key={href} className="transition hover:text-[#0d3328]" href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-full border border-[#1b342b]/15 bg-white px-4 py-2 text-sm font-bold text-[#0b2f25] shadow-sm shadow-stone-900/5 transition hover:bg-[#eff8d2]"
          >
            Login
          </Link>
          <Link
            to="/register-owner"
            className="rounded-full bg-[#0b4a3a] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Create owner account
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-[#1b342b]/10 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle mobile menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#1b342b]/10 bg-[#f4efe3] px-5 py-5 md:hidden">
          <div className="grid gap-3 text-sm font-medium">
            {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            <Link
              to="/register-owner"
              className="mt-2 rounded-full bg-[#0b4a3a] px-5 py-3 text-center font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Create owner account
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}

function DashboardPreview() {
  const [transform, setTransform] = useState('rotateX(2deg) rotateY(-4deg)')

  return (
    <div
      className="dashboard-perspective"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        setTransform(`rotateX(${2 - y * 5}deg) rotateY(${-4 + x * 6}deg)`)
      }}
      onPointerLeave={() => setTransform('rotateX(2deg) rotateY(-4deg)')}
    >
      <div
        className="dashboard-window motion-soft-float"
        style={{ transform } satisfies CSSProperties}
      >
        <div className="flex h-12 items-center justify-between border-b border-[#e1e7e1] bg-[#f7f8f5] px-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#df8d79]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e2ba72]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#79be90]" />
          </div>
          <div className="hidden rounded-full bg-white px-4 py-1.5 text-[11px] text-[#748078] shadow-sm sm:block">
            app.rentalroom.local/owner/dashboard
          </div>
          <span className="text-[11px] font-semibold text-[#0b4a3a]">Live</span>
        </div>

        <div className="relative overflow-hidden bg-[#f7f8f5] text-[#173128]">
          <span className="dashboard-light-orb dashboard-light-orb-left" />
          <span className="dashboard-light-orb dashboard-light-orb-right" />
          <div className="relative border-b border-[#e7ece7] bg-white/78 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0a4436] text-white">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <strong className="block text-sm font-semibold">Rental Room</strong>
                  <span className="text-[11px] text-[#748078]">Owner workspace</span>
                </div>
              </div>

              <nav className="hidden flex-wrap items-center gap-1 rounded-full bg-[#eff8f2] p-1 text-[11px] font-semibold text-[#667169] md:flex">
                {['Overview', 'Rooms', 'Tenants', 'Contracts', 'Billing', 'AI Assistant'].map(
                  (item, index) => (
                    <span
                      key={item}
                      className={`rounded-full px-3 py-2 ${
                        index === 0 ? 'bg-[#0a4436] text-white' : ''
                      }`}
                    >
                      {item}
                    </span>
                  ),
                )}
              </nav>

              <div className="flex items-center gap-2 rounded-full bg-[#eff8f2] px-3 py-2 text-[11px] font-semibold text-[#0a4436]">
                <span className="h-2 w-2 rounded-full bg-[#3ca766]" />
                Owner
              </div>
            </div>
          </div>

          <div className="relative grid gap-4 p-4 md:grid-cols-[1.1fr_.9fr] md:p-6">
            <section className="rounded-2xl border border-[#e1e7e1] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-normal text-[#748078]">
                    Portfolio pulse
                  </p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-normal text-[#12372c]">
                    92% occupied
                  </h3>
                </div>
                <span className="motion-pulse-glow rounded-full bg-[#b8ff68] px-3 py-1.5 text-[11px] font-semibold text-[#12372c]">
                  Healthy
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ['18', 'Rooms', 'metric-line'],
                  ['$18.4k', 'Revenue', 'metric-line metric-line-amber'],
                  ['07', 'Open bills', 'metric-line metric-line-violet'],
                ].map(([value, label, lineClass], index) => (
                  <div
                    key={label}
                    className="metric-card rounded-xl border border-[#edf0ed] bg-[#f7f8f5] p-4"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <strong className="block text-xl font-semibold">{value}</strong>
                    <span className="text-[11px] text-[#748078]">{label}</span>
                    <div className={lineClass} />
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[#edf0ed] bg-[#fbfcfa] p-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#748078]">
                  <span>Monthly collection</span>
                  <span>Jan - Jul</span>
                </div>
                <div className="mt-5 flex h-36 items-end gap-2">
                  {[42, 58, 44, 72, 64, 86, 78].map((height, index) => (
                    <span
                      key={height}
                      className="chart-bar flex-1 rounded-t-lg bg-[linear-gradient(180deg,#b8ff68,#63a486)]"
                      style={{
                        height: `${height}%`,
                        opacity: 0.72 + index * 0.03,
                      }}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4">
              <article className="motion-float-card rounded-2xl border border-[#e1e7e1] bg-[#0a4436] p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#b8ff68]">
                    <Bot className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] text-white/48">AI Assistant</span>
                </div>
                <p className="mt-5 text-sm leading-6 text-white/72">
                  Two overdue bills and one contract renewal need attention this week.
                </p>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#b8ff68] px-4 py-2 text-xs font-semibold text-[#12372c]"
                >
                  Draft reminders
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </article>

              {[
                ['Room B-401', 'Rent overdue by 5 days', 'High'],
                ['Room A-203', 'Contract renews in 12 days', 'Medium'],
                ['Room C-102', 'Ready for listing update', 'Low'],
              ].map(([room, note, priority], index) => (
                <article
                  key={room}
                  className="motion-toast-card rounded-2xl border border-[#e1e7e1] bg-white p-4 shadow-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <strong className="block text-sm">{room}</strong>
                      <span className="mt-1 block text-[11px] text-[#748078]">{note}</span>
                    </div>
                    <span className="rounded-full bg-[#eff8d2] px-3 py-1 text-[10px] font-semibold text-[#355a2c]">
                      {priority}
                    </span>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductLanding() {
  const [activeStep, setActiveStep] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Your portfolio is healthy. I found three items worth your attention today.',
    },
  ])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((step) => (step + 1) % workflowSteps.length)
    }, 3200)

    return () => window.clearInterval(timer)
  }, [])

  function askAi(prompt: string) {
    setMessages((current) => [...current, { role: 'user', text: prompt }])
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: aiAnswers[prompt] ?? aiAnswers['What needs attention?'],
        },
      ])
    }, 350)
  }

  const CurrentIcon = workflowSteps[activeStep].icon

  return (
    <div id="rental-room" className="bg-[#f4efe3] text-[#14231e]">
      <LandingNav />

      <main>
        <section
          id="story"
          className="relative overflow-hidden pb-24 pt-20 lg:pb-32 lg:pt-28"
        >
          <div className="hero-grid-lines absolute inset-0 opacity-50" />
          <div className="absolute -right-24 top-16 h-[420px] w-[420px] rounded-full bg-[#b8ff68]/35 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 px-5 md:px-8 lg:grid-cols-[.88fr_1.12fr]">
            <Reveal>
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1b342b]/10 bg-white/55 px-4 py-2 text-[11px] font-semibold uppercase tracking-normal text-[#9b5d32] backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9b5d32]" />
                  Rental operations, reimagined
                </div>
                <h2 className="max-w-3xl text-5xl font-medium leading-none tracking-normal text-[#12372c] md:text-6xl lg:text-7xl">
                  Manage rooms without losing the thread.
                </h2>
                <p className="mt-8 max-w-xl text-base leading-8 text-[#65716b] md:text-lg">
                  A focused workspace for room status, tenants, contracts, bills, and
                  payment follow-up, built for the daily rhythm of a modern rental
                  business.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    className="group inline-flex items-center gap-3 rounded-full bg-[#0b4a3a] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-1"
                    to="/login"
                  >
                    Continue to login
                    <ArrowRight
                      className="h-4 w-4 transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                  <Link
                    className="rounded-full border border-[#1b342b]/15 bg-white/60 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-white"
                    to="/register-owner"
                  >
                    Create owner account
                  </Link>
                </div>

                <div className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-[#1b342b]/10 pt-6">
                  {[
                    ['Roles', 'Owner / Tenant'],
                    ['Payments', 'Mock flow ready'],
                    ['Access', 'JWT protected'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold uppercase tracking-normal text-[#748078]">
                        {label}
                      </p>
                      <strong className="mt-2 block text-sm md:text-base">{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <DashboardPreview />
            </Reveal>
          </div>
        </section>

        <section className="bg-[#0a4033] py-24 text-white lg:py-32">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <Reveal>
              <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-normal text-[#b8ff68]">
                    Live portfolio pulse
                  </p>
                  <h2 className="mt-5 text-4xl font-medium leading-tight tracking-normal md:text-6xl">
                    A product preview that tells a story at a glance.
                  </h2>
                </div>
                <p className="max-w-2xl text-lg leading-8 text-white/62 lg:justify-self-end">
                  Operational noise becomes signals: occupied rooms, revenue,
                  expiring contracts, and overdue bills turn into a prioritized daily view.
                </p>
              </div>
            </Reveal>

            <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                ['18', 'Active rooms', '+2 this month'],
                ['92%', 'Occupancy', 'Healthy portfolio'],
                ['$18.4k', 'Monthly revenue', '+12.2%'],
                ['07', 'Open bills', '2 overdue'],
              ].map(([value, label, note], index) => (
                <Reveal key={label} delay={index * 70}>
                  <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-7 transition duration-300 hover:-translate-y-2 hover:bg-white/[0.09]">
                    <span className="text-4xl font-light tracking-normal md:text-5xl">
                      {value}
                    </span>
                    <p className="mt-7 text-sm font-semibold">{label}</p>
                    <p className="mt-2 text-xs text-white/48">{note}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-24 lg:py-32">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <Reveal>
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-normal text-[#a15f31]">
                  One connected operating system
                </p>
                <h2 className="mt-5 text-4xl font-medium leading-tight tracking-normal md:text-6xl">
                  Every object knows what it belongs to.
                </h2>
              </div>
            </Reveal>

            <div className="mt-14 grid auto-rows-[minmax(220px,auto)] gap-4 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                const isDark = feature.className.includes('text-white')

                return (
                  <Reveal
                    key={feature.title}
                    delay={index * 60}
                    className={feature.className.includes('row-span-2') ? 'lg:row-span-2' : ''}
                  >
                    <article
                      className={`feature-card h-full rounded-2xl border border-[#1b342b]/10 p-7 md:p-9 ${feature.className}`}
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`grid h-12 w-12 place-items-center rounded-lg ${
                            isDark ? 'bg-white/10 text-[#b8ff68]' : 'bg-[#0a4436] text-white'
                          }`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                        </span>
                        <span className={`text-xs ${isDark ? 'text-white/45' : 'text-[#718078]'}`}>
                          0{index + 1}
                        </span>
                      </div>

                      <div className={feature.className.includes('row-span-2') ? 'mt-24 lg:mt-48' : 'mt-14'}>
                        <h3 className="text-2xl font-medium tracking-normal">
                          {feature.title}
                        </h3>
                        <p
                          className={`mt-4 max-w-md text-sm leading-7 ${
                            isDark ? 'text-white/62' : 'text-[#64716a]'
                          }`}
                        >
                          {feature.description}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="overflow-hidden bg-[#e9e3d6] py-24 lg:py-32">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <Reveal>
              <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-normal text-[#9f5b31]">
                    A clean operational chain
                  </p>
                  <h2 className="mt-5 text-4xl font-medium leading-tight tracking-normal md:text-6xl">
                    From empty room to paid bill.
                  </h2>
                </div>
                <p className="max-w-xl text-base leading-8 text-[#667169] lg:justify-self-end">
                  Each step inherits the context created before it, reducing duplicate
                  entry and keeping the audit trail understandable.
                </p>
              </div>
            </Reveal>

            <div className="mt-16 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
              <Reveal>
                <div className="relative overflow-hidden rounded-2xl bg-[#0a4033] p-6 text-white md:p-10">
                  <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#b8ff68]/20 blur-3xl" />
                  <div className="relative grid gap-3">
                    {workflowSteps.map((step, index) => {
                      const Icon = step.icon
                      const isActive = index === activeStep
                      const isDone = index < activeStep

                      return (
                        <button
                          key={step.title}
                          type="button"
                          className={`grid w-full grid-cols-[44px_1fr_auto] items-center gap-4 rounded-xl border px-4 py-4 text-left transition duration-300 ${
                            isActive
                              ? 'border-[#b8ff68]/60 bg-white/10'
                              : 'border-white/5 bg-white/[0.025] hover:bg-white/[0.06]'
                          }`}
                          onClick={() => setActiveStep(index)}
                        >
                          <span
                            className={`grid h-11 w-11 place-items-center rounded-lg ${
                              isActive
                                ? 'bg-[#b8ff68] text-[#12382c]'
                                : isDone
                                  ? 'bg-white/15 text-[#b8ff68]'
                                  : 'bg-white/[0.07] text-white/55'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <Icon className="h-5 w-5" aria-hidden="true" />
                            )}
                          </span>
                          <span>
                            <small className="text-[9px] font-semibold uppercase tracking-normal text-white/38">
                              Step 0{index + 1}
                            </small>
                            <strong className="mt-1 block text-sm font-semibold">
                              {step.title}
                            </strong>
                          </span>
                          <ArrowRight
                            className={`h-4 w-4 transition ${
                              isActive ? 'translate-x-0 text-[#b8ff68]' : '-translate-x-2 text-white/22'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      )
                    })}
                  </div>
                  <div className="relative mt-6 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#b8ff68] transition-all duration-500"
                      style={{
                        width: `${((activeStep + 1) / workflowSteps.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="flex h-full min-h-[520px] flex-col justify-between rounded-2xl border border-[#1b342b]/10 bg-white p-8 md:p-10">
                  <div className="flex items-start justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-lg bg-[#d8efca] text-[#0a4436]">
                      <CurrentIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="text-xs text-[#748078]">0{activeStep + 1} / 05</span>
                  </div>
                  <div className="my-auto py-10">
                    <p className="text-[11px] font-semibold uppercase tracking-normal text-[#9f5b31]">
                      Current stage
                    </p>
                    <h3 className="mt-4 text-4xl font-medium tracking-normal md:text-5xl">
                      {workflowSteps[activeStep].title}
                    </h3>
                    <p className="mt-6 max-w-md text-base leading-8 text-[#667169]">
                      {workflowSteps[activeStep].body}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#f4efe3] p-5">
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      <ShieldCheck className="h-4 w-4 text-[#0c604a]" aria-hidden="true" />
                      Context moves forward automatically
                    </div>
                    <p className="mt-2 pl-7 text-xs leading-6 text-[#748078]">
                      No retyping room, tenant, or agreement details at each step.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="ai" className="bg-[#081a14] py-24 text-white lg:py-32">
          <div className="mx-auto grid max-w-[1240px] gap-14 px-5 md:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-normal text-[#b8ff68]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  AI operations layer
                </div>
                <h2 className="mt-6 text-4xl font-medium leading-tight tracking-normal md:text-6xl">
                  The assistant watches the gaps between screens.
                </h2>
                <p className="mt-7 max-w-xl text-base leading-8 text-white/58">
                  It combines room, tenant, contract, and billing context to summarize
                  risk and draft the next message while the owner remains in control.
                </p>
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  {aiCards.map(({ icon: Icon, title, body }) => {
                    return (
                      <article
                        key={title}
                        className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"
                      >
                        <Icon className="h-5 w-5 text-[#b8ff68]" aria-hidden="true" />
                        <h3 className="mt-5 text-sm font-semibold">{title}</h3>
                        <p className="mt-2 text-xs leading-6 text-white/48">{body}</p>
                      </article>
                    )
                  })}
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10271f] shadow-[0_35px_100px_rgba(0,0,0,.35)]">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#b8ff68] text-[#12382c]">
                      <Bot className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <strong className="block text-sm">Room Intelligence</strong>
                      <small className="text-[10px] text-white/42">
                        Connected to live portfolio context
                      </small>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#b8ff68] shadow-[0_0_0_5px_rgba(184,255,104,.1)]" />
                </div>

                <div className="ai-message-scroll flex min-h-[340px] max-h-[430px] flex-col gap-4 overflow-y-auto p-6">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`max-w-[86%] rounded-xl px-4 py-3 text-sm leading-6 ${
                        message.role === 'assistant'
                          ? 'self-start bg-white/[0.07] text-white/72'
                          : 'self-end bg-[#b8ff68] text-[#15372d]'
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 p-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {Object.keys(aiAnswers).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => askAi(prompt)}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] text-white/58 transition hover:bg-white/10 hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => askAi('What needs attention?')}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#081a14] px-4 py-4 text-left text-sm text-white/45"
                  >
                    <span className="inline-flex items-center gap-2">
                      <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                      Ask about your portfolio
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#b8ff68] text-[#12382c]">
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-5 py-20 md:px-8 lg:py-28">
          <Reveal>
            <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-2xl bg-[#b8ff68] px-7 py-16 md:px-14 md:py-20">
              <div className="absolute -right-10 -top-28 h-80 w-80 rounded-full border border-[#174432]/15" />
              <div className="absolute -right-28 -top-10 h-80 w-80 rounded-full border border-[#174432]/15" />
              <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-normal text-[#41684f]">
                    Ready for the real workflow?
                  </p>
                  <h2 className="mt-5 max-w-4xl text-4xl font-medium leading-tight tracking-normal text-[#12372c] md:text-6xl">
                    Turn every room into a connected operation.
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <Link
                    className="inline-flex items-center gap-3 rounded-full bg-[#0a4033] px-6 py-3.5 text-sm font-semibold text-white"
                    to="/register-owner"
                  >
                    Create owner account
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    className="rounded-full border border-[#174432]/20 bg-white/35 px-6 py-3.5 text-sm font-semibold text-[#12372c]"
                    to="/login"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-[#1b342b]/10 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 text-xs text-[#6b7770] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-[#15362b]">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            Rental Room
          </div>
          <p>Portfolio landing concept, built into the existing Rental Room app.</p>
        </div>
      </footer>
    </div>
  )
}

export function HomePage() {
  return (
    <>
      <CinematicHero />
      <ProductLanding />
    </>
  )
}

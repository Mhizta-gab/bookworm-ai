import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  Circle,
  Layers3,
  Mail,
  Menu,
  MessageCircle,
  NotepadText,
  Sparkles,
} from "lucide-react";
import styles from "./page.module.css";

const tickerRows = [
  {
    className: styles.tickerCoral,
    items: [
      "Quick Capture",
      "Centralize",
      "2-Way Integration",
      "Linked To Slack",
      "Quick Capture",
      "Centralize",
      "2-Way Integration",
      "Linked To Slack",
    ],
  },
  {
    className: styles.tickerBlue,
    items: [
      "Flexible View",
      "Prioritize",
      "Smart Scoring",
      "Professional & Personal",
      "Flexible View",
      "Prioritize",
      "Smart Scoring",
      "Professional & Personal",
    ],
  },
  {
    className: styles.tickerGold,
    items: [
      "Updates Your Tools",
      "Progress",
      "Delegate With Ease",
      "No More Follow-Up",
      "Delegate With Ease",
      "Updates Your Tools",
      "Progress",
      "Delegate With Ease",
    ],
  },
];

const testimonialCards = [
  {
    brand: "collective.",
    text: "I use Kairn everyday to balance the day with all the projects and share priorities with the team.",
    name: "Rémi Lauer",
    role: "Lead Growth",
  },
  {
    brand: "actiondesk",
    text: "Kairn helps me stay on top of every thing I need to do in a simple and efficient manner.",
    name: "Louis Adam",
    role: "Chief of Staff",
  },
  {
    brand: "FoodChéri",
    text: "With Kairn, we've centralized the team's tasks and it's made our discussions and priorities more structured.",
    name: "Laurent Patouche",
    role: "Head of Product & Ops",
  },
  {
    brand: "STAYCATION",
    text: "I've been using Kairn for months and it's become a must have in my day to keep everything in check.",
    name: "Matthieu Dugast",
    role: "Co-founder",
  },
  {
    brand: "Unflow",
    text: "Between calls, follow ups, and random ideas that pop into my head all day goes on, Kairn has become my must have.",
    name: "Romy Lynch",
    role: "Co-founder & CEO",
  },
  {
    brand: "trusty",
    text: "Your OPT + CMD + K has simply changed my life.",
    name: "Edouard Peyrusseigt",
    role: "Co-founder & CEO",
  },
];

const pricingTiers = [
  {
    label: "For busy people",
    price: "FREE",
    subprice: "",
    accent: styles.pricingGreen,
    features: [
      "Unlimited projects",
      "Unlimited connected apps",
      "Unlimited members",
      "Up to 500 tasks updated per month",
    ],
    cta: "Try Kairn!",
  },
  {
    label: "For busy teams",
    price: "$5",
    subprice: "/month /user",
    accent: styles.pricingBlue,
    features: [
      "Unlimited tasks updates",
      "Activity log",
      "Collaborative Workspace",
      "Admin notes",
    ],
    cta: "Try Kairn!",
  },
  {
    label: "For big busy teams",
    price: "$10",
    subprice: "/month /user",
    accent: styles.pricingCoral,
    features: [
      "Permission management",
      "Admin tool",
      "Public boards & guests",
      "Custom workflows",
    ],
    cta: "Coming soon",
    muted: true,
  },
];

function TickerBadge({ text }: { text: string }) {
  return (
    <span className={styles.tickerBadge}>
      <span className={styles.tickerDot} />
      {text}
    </span>
  );
}

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.navbarWrap}>
        <nav className={styles.navbar}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>
              <BookOpen size={15} strokeWidth={2.2} />
            </div>
            <span className={styles.brandText}>kairn</span>
          </div>
          <div className={styles.navPill}>Product Hunt #1 Product of the Day</div>
          <div className={styles.navLinks}>
            <a href="#manifesto">Manifesto</a>
            <a href="#testimonials">Twitter</a>
            <a href="#pricing">Sign in</a>
          </div>
          <a href="#cta" className={styles.ctaButton}>
            Try Kairn!
          </a>
        </nav>
      </div>

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <h1 className={styles.heroTitle}>
                Regain <span>control</span>
                <br />
                over your days
              </h1>
              <p className={styles.heroText}>
                Stop rushing - centralize, prioritize and progress on projects across apps on a daily basis.
              </p>
              <a href="#cta" className={styles.ctaButton}>
                Try Kairn!
              </a>
            </div>

            <div className={styles.heroArtwork}>
              <div className={styles.miniPanel}>
                <div className={styles.miniPanelHeader}>
                  <span>Review pricing slide</span>
                  <ArrowRight size={14} />
                </div>
                <div className={styles.miniTags}>
                  <span>Alex B.</span>
                  <span>New offer</span>
                  <span>Medium</span>
                  <span>Today</span>
                </div>
              </div>

              <div className={styles.mainPanel}>
                <div className={styles.mainPanelHeader}>
                  <div>
                    <strong>New offer</strong>
                    <div className={styles.mainPanelMeta}>Shared by • Planned • Impact • Archived</div>
                  </div>
                  <span className={styles.plusBadge}>+</span>
                </div>

                <div className={styles.sharedBadge}>Emilia</div>
                <div className={styles.priorityFlag}>High priority</div>

                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className={styles.taskLine}>
                    <Circle size={14} strokeWidth={1.7} />
                    <div className={styles.taskBar} />
                    <div className={styles.taskTag} />
                    <div className={styles.taskAvatars}>
                      <span />
                      <span />
                    </div>
                  </div>
                ))}

                <div className={styles.ownerBadge}>Steve</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.tickers}>
        {tickerRows.map((row) => (
          <div key={row.className} className={`${styles.tickerRow} ${row.className}`}>
            <div className={styles.tickerTrack}>
              {row.items.concat(row.items).map((item, index) => (
                <TickerBadge key={`${item}-${index}`} text={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <section className={styles.section} id="manifesto">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Centralize</h2>
            <p>
              Keep track of everything you need to do across tools with ease. With Kairn, get clarity on what to do in
              one place.
            </p>
          </div>

          <div className={styles.featureGrid}>
            <article className={`${styles.card} ${styles.cardPeriwinkle}`}>
              <div className={styles.cardCopy}>
                <h3>Capture anywhere</h3>
                <p>
                  Add tasks in a click as they happen, where they happen. Kairn links the task to the right page for
                  when you&apos;re ready to get started.
                </p>
              </div>
              <div className={styles.captureMock}>
                <div className={styles.captureTop}>
                  <span>Review pricing slide</span>
                  <ArrowRight size={14} />
                </div>
                {[0, 1, 2].map((item) => (
                  <div key={item} className={styles.captureRow}>
                    <span className={styles.captureBox} />
                    <span className={styles.captureLine} />
                    <span className={styles.captureIcons}>
                      <span />
                      <span />
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className={`${styles.card} ${styles.cardWhite}`}>
              <div className={styles.cardCopy}>
                <h3>Smart integrations</h3>
                <p>
                  No need to search through your tools to find your tasks. Kairn does it for you. When you get tagged
                  on a task on Notion, it&apos;s added to Kairn.
                </p>
              </div>
              <div className={styles.integrationGraph}>
                <div className={styles.integrationHub}>
                  <Layers3 size={22} />
                </div>
                <div className={styles.integrationNode} style={{ top: "8%", left: "58%" }}>
                  <NotepadText size={18} />
                </div>
                <div className={styles.integrationNode} style={{ top: "48%", left: "18%" }}>
                  <MessageCircle size={18} />
                </div>
                <div className={styles.integrationNode} style={{ top: "70%", left: "66%" }}>
                  <Sparkles size={18} />
                </div>
                <div className={styles.integrationLineA} />
                <div className={styles.integrationLineB} />
                <div className={styles.integrationLineC} />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Prioritize</h2>
            <p>
              Projects never progress because of all the little things that get in the way. With Kairn easily manage
              both the daily rush and long term projects.
            </p>
          </div>

          <div className={styles.stack}>
            <article className={`${styles.card} ${styles.cardGold} ${styles.splitCard}`}>
              <div className={styles.cardCopyWide}>
                <span className={styles.labelPill}>Smart Views</span>
                <h3>Switch between project and daily tasks to make the most of your days.</h3>
                <p>Select views according to your needs and style, as a team or on your own.</p>
                <div className={styles.buttonRow}>
                  <button type="button" className={styles.smallButton}>
                    Project view
                  </button>
                  <button type="button" className={styles.smallButton}>
                    Task view
                  </button>
                </div>
              </div>

              <div className={styles.tasksBoard}>
                <div className={styles.tasksBoardHeader}>
                  <strong>My Tasks</strong>
                  <div className={styles.boardIcons}>
                    <Menu size={14} />
                    <Layers3 size={14} />
                  </div>
                </div>
                <div className={styles.boardTags}>
                  <span>Impact</span>
                  <span>Planned</span>
                  <span>+</span>
                </div>
                <div className={styles.priorityFlagBoard}>High priority</div>
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className={styles.boardRow}>
                    <span className={styles.boardCheck}>{item === 1 ? <Check size={12} /> : null}</span>
                    <span className={styles.boardText} />
                    <span className={styles.boardPill} />
                    <span className={styles.boardAvatar} />
                  </div>
                ))}
              </div>
            </article>

            <article className={`${styles.card} ${styles.cardWhite} ${styles.splitCard}`}>
              <div className={styles.cardCopyWide}>
                <h3>
                  Professional
                  <br />+ Personal
                </h3>
                <p>
                  Your day is a mix of personal and professional projects so Kairn is designed for both. Only data in
                  shared projects can be accessed by your team, the rest is yours only.
                </p>
              </div>

              <div className={styles.personalGraph}>
                <div className={styles.personalCenter}>
                  <BookOpen size={20} />
                </div>
                {["Launch 4.0", "Next launch", "OKR 2027", "NPS 2027", "Summer 29", "Sport Prog"].map(
                  (label, index) => (
                    <div key={label} className={styles.personalNode} data-index={index}>
                      {label}
                    </div>
                  ),
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Progress</h2>
            <p>
              Never lose precious time updating tools&apos; statuses or asking your team for updates. Kairn connects it
              all so you focus on doing instead of running around.
            </p>
          </div>

          <div className={styles.featureGrid}>
            <article className={`${styles.card} ${styles.cardCoral}`}>
              <div className={styles.cardCopy}>
                <h3>Supercharge your apps</h3>
                <p>
                  Kairn updates synced tools. When you mark tasks as done on Kairn, it updates tools back, so your
                  projects keep on progressing.
                </p>
              </div>
              <div className={styles.syncStack}>
                <div className={styles.syncCardTop}>
                  <div className={styles.syncApp}>
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <strong>Kairn App</strong>
                    <p>Remind me about this task only when it comes with a due date.</p>
                  </div>
                </div>
                {["Review email", "Medium", "Today", "Finish design slide"].map((item, index) => (
                  <div key={item} className={styles.syncRow}>
                    <span className={styles.syncIcon}>{index === 0 ? <Mail size={12} /> : <BadgeCheck size={12} />}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className={`${styles.card} ${styles.cardWhite}`}>
              <div className={styles.cardCopy}>
                <h3>Share the load</h3>
                <p>
                  Share projects from Kairn with your team, they&apos;ll receive it in Slack - even non Kairn users.
                  When they progress, you&apos;re directly updated.
                </p>
              </div>
              <div className={styles.peopleCluster}>
                <div className={styles.personA} />
                <div className={styles.personB} />
                <div className={styles.personC} />
                <div className={styles.personD} />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.darkBanner}>
        <div className={styles.container}>
          <h2>Stop putting out fires, start achieving</h2>
          <p>Currently in free beta save your early-bird spot!</p>
        </div>
      </section>

      <section className={styles.pricingSection} id="pricing">
        <div className={styles.container}>
          <div className={styles.pricingGrid}>
            {pricingTiers.map((tier) => (
              <article key={tier.label} className={`${styles.pricingCard} ${tier.accent}`}>
                <h3>{tier.label}</h3>
                <div className={styles.pricingValue}>
                  <span>{tier.price}</span>
                  {tier.subprice ? <small>{tier.subprice}</small> : null}
                </div>
                <a
                  href="#cta"
                  className={`${styles.pricingButton} ${tier.muted ? styles.pricingButtonMuted : ""}`}
                >
                  {tier.cta}
                </a>
                <ul className={styles.pricingList}>
                  {tier.features.map((feature) => (
                    <li key={feature}>
                      <span className={styles.listDot} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.testimonialsSection} id="testimonials">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>People are loving Kairn!</h2>
          </div>
          <div className={styles.testimonialGrid}>
            {testimonialCards.map((card) => (
              <article key={card.brand} className={styles.testimonialCard}>
                <h3>{card.brand}</h3>
                <p>{card.text}</p>
                <div className={styles.testimonialFooter}>
                  <span className={styles.userChip} />
                  <div>
                    <strong>{card.name}</strong>
                    <small>{card.role}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalSection} id="cta">
        <div className={styles.container}>
          <div className={styles.finalCard}>
            <div className={styles.finalCopy}>
              <h2>
                It&apos;s time to get
                <br />a great day
              </h2>
              <p>Kairn iOS stays with you on the go no matter where and when.</p>
              <a href="#pricing" className={styles.ctaButton}>
                Try Kairn!
              </a>
            </div>
            <div className={styles.phoneWrap}>
              <div className={styles.phone}>
                <div className={styles.phoneTop} />
                <div className={styles.phoneScreen}>
                  <div className={styles.phoneWidget} />
                  <div className={styles.phoneStack}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.phoneApps}>
                    <div className={styles.appSquare} />
                    <div className={styles.appSquare} />
                    <div className={styles.appSquare} />
                    <div className={styles.appSquare} />
                  </div>
                  <div className={styles.phoneBubble}>
                    <MessageCircle size={14} />
                    <span>Add a new task</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div className={styles.brandFooter}>
              <div className={styles.brandMark}>
                <BookOpen size={15} strokeWidth={2.2} />
              </div>
              <div>
                <span className={styles.brandTextLight}>kairn</span>
                <p>Your daily project management app to get great days</p>
              </div>
            </div>
            <div className={styles.socialRow}>
              <span>t</span>
              <span>M</span>
              <span>in</span>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>Crafted with love by Alastair & delia mattia</p>
            <div>
              <a href="#pricing">Legal doc</a>
              <a href="#pricing">Privacy</a>
              <a href="#pricing">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function HowItWorks() {
  const steps = [
    { step: "01", title: "Connect", desc: "Upload your PDFs and connect your bookshelf.", img: "/step1.png" },
    { step: "02", title: "Analyze", desc: "We index every word and prepare your book for dialogue.", img: "/step2.png" },
    { step: "03", title: "Speak", desc: "Start talking. Learn deeper. Remember more.", img: "/step3.png" },
  ];

  return (
    <section id="how" className="community-section wf-section">
      <div className="container pr max1608 w-container">
        <div className="communityicon">
          <img src="/team.png" loading="eager" width="342" alt="team" className="img" />
        </div>
        <div className="howitworksbox">
          <h2 className="heading3 white"><span className="pr20">Here’s how</span><span className="green-text"> it works</span></h2>
          <div className="heading5 white">You’re busy, so we’ll make this easy.</div>
        </div>
        <div className="steplist">
          {steps.map(s => (
            <div key={s.step} className="stepitem">
              <div className="stepbox">
                <img src={s.img} loading="eager" alt={s.title} className="img" />
              </div>
              <div className="heading5">{s.step}</div>
              <p className="p24 mb0 font20">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="blackbox"><div className="blackbg" /></div>
    </section>
  );
}

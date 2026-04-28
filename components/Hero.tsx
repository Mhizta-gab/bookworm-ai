"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero-secion wf-section">
      <div className="container pr w-container">
        <div className="hero-head">
          <div className="headingbox">
            <h1 className="heading2 white">How</h1>
            <div className="box106">
              <img src="/book-icon.png" loading="eager" width="106" alt="Book" />
            </div>
            <h1 className="heading2 white"><span className="orangetext whitetext">Readers</span></h1>
          </div>
          <div className="headingbox padding">
            <h1 className="heading2 white"><span className="green-text whitetext">Hear</span></h1>
            <div className="box80">
              <img src="/headphone-icon.png" loading="eager" width="80" alt="Headphone" />
            </div>
          </div>
          <h1 className="heading2 white pad">Books.</h1>
        </div>
        <div className="hero-row">
          <div className="hero-img">
            <img src="/hero-img.png" loading="eager" width="814" alt="Hero" className="heroimg" />
          </div>
          <div className="hero-detail">
            <h3 className="heading3 white none">Where every book finds its voice.</h3>
            <p className="hero-p">Upload any PDF. Speak to it. Hear it answer back in a voice crafted just for that book. Bookworm AI is the voice-first reading companion for curious minds.</p>
            <Link href="/sign-up" className="button-3 w100 w-inline-block">
              <div className="btn-text">Start Reading for Free</div>
              <div className="btn-icon">
                <div className="btnicon-2"></div>
                <div className="btniconone-2"></div>
                <div className="btniconbig-2"></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="roundicon">
        <img src="/dot-pattern.png" loading="eager" sizes="100vw" width="1488" alt="Rounddot" />
      </div>
    </section>
  );
}

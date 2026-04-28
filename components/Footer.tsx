import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer wf-section">
      <div className="joinblock">
        <div className="container w-container">
          <div className="joinrow">
            <div className="joinushead">
              <div className="joinuscol1"><h1 className="heading white mb0 animation">Join us in the <span className="pinktext">‘worms</span></h1></div>
              <div className="joinuscol2"><div className="subheading animation pb15">We’ll manage the mundane so you have the space (and brainpower) to create an experience your community can't get enough of.</div>
                <Link href="/features" className="button-3 w100 w-inline-block"><div className="btn-text">Learn More</div></Link>
              </div>
            </div>
            <div className="joinimg"><img src="/jointeam.png" loading="eager" alt="Join team" className="img" /></div>
          </div>
        </div>
      </div>
      <div className="footerblock">
        <div className="container1680 w-container">
          <div className="footerrow">
            <div className="footercol1">
              <div className="footeritem pr165">
                <div className="subheading2 bold white">Company</div>
                <div className="footerlist"><Link href="/about-us" className="footlink">About Us</Link></div>
              </div>
            </div>
            <div className="footercol2">
              <div className="footercolbox"><div className="subheading2 bold white mb25">Contact</div>
                <a href="mailto:support@bookworm.ai" className="footerlink">support@bookworm.ai</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

export default function CommunitySection() {
  return (
    <section className="slider-section wf-section">
      <div className="container pr max1608 w-container">
        <div className="communityhead">
          <h3 className="heading4">Top readers have engaged libraries <br/>&zwj;<span className="pinktext">now you can too!</span></h3>
        </div>
        <div className="community-list">
          <div className="community-item fullitem">
            <div className="community-box max560">
              <h5 className="heading5">Take a peek around.</h5>
              <p className="p20 mb40">Peruse insights from book activity, voice conversations, and personal libraries to really understand how to get—and keep—your readers engaged.</p>
              <Link href="/features" className="button-link w-inline-block">
                <div>Learn More</div>
                <div className="linkiconbox">
                  <div className="linkiconone"></div>
                  <div className="linkicontwo"></div>
                  <div className="linkiconthree"></div>
                </div>
              </Link>
            </div>
            <div className="community-img communityimg">
              <img src="/chart.png" loading="eager" width="896" alt="" className="tabimg" />
              <img src="/chart-mobile.png" loading="eager" width="896" alt="" className="fullimg" />
            </div>
          </div>
          <div className="community-item greenbg">
            <div className="community-box pb40">
              <h5 className="heading5 max450">Avoid that awkward radio silence.</h5>
              <p className="p20 mb40 max500">Start discussions in your library, spaces, groups, or with readers directly in voice conversations—either pre-scheduled or in real-time.</p>
              <Link href="/features" className="button-link w-inline-block">Learn More</Link>
            </div>
            <div className="community-img">
              <img src="/fashion-school.png" loading="eager" width="614" alt="Example" />
            </div>
          </div>
          <div className="community-item orangebg">
            <div className="community-img pb40">
              <img src="/group.png" loading="eager" width="614" alt="Group" />
            </div>
            <div className="community-box mobiletop">
              <h5 className="heading5">Let us get everyone settled.</h5>
              <p className="p20 mb40 max500">Automatically add readers to library spaces or give them access to content in your collections—without lifting a finger.</p>
              <Link href="/features" className="button-link w-inline-block">Learn More</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

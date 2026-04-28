export default function Testimonials() {
  const people = [
    { name: "Seun Kolawole", role: "Scholar in Residence", quote: "I asked Daniel about the habit loop at midnight and ended up in a conversation that went on for an hour." , img: "/seun.png" },
    { name: "Tatiana Figueiredo", role: "Entrepreneur", quote: "A thoughtful tool by great, community-minded humans. It turned my PDF collection into a living archive.", img: "/tatiana.png" },
    { name: "Amara Mensah", role: "Graduate Researcher", quote: "Bookworm gives me a voice for every page! It's like having a conversation with the author themselves.", img: "/amara.png" },
  ];

  return (
    <section id="voices" className="customer-section wf-section">
      <div className="container pr w-container">
        <div className="customer-row">
          <div className="customer-head">
            <h1 className="heading lh110"><span className="font200">Our</span> <span className="font112">readers</span></h1>
            <h1 className="heading white font40">l<span className="box89"> </span>ve us.</h1>
          </div>
          <div className="collection-list">
            {people.map(p => (
              <div key={p.name} className="customer-item">
                <div className="customer-box">
                  <div className="customerrow">
                    <div style={{backgroundColor: '#ffd6c0'}} className="customer-img">
                      <img src={p.img} loading="eager" alt={p.name} className="customerimg" />
                    </div>
                    <div className="customer-detail">
                      <div className="subheading2 bold font18">{p.name}</div>
                      <div className="customer-logo"><div className="customer-text">{p.role}</div></div>
                    </div>
                  </div>
                  <div className="p20 w-richtext"><p>{p.quote}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

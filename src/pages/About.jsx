import SiteHeader from "../components/SiteHeader";

function About() {
  return (
    <>
      <SiteHeader />

      <main className="container py-5">
        <div className="mx-auto text-start" style={{ maxWidth: "800px" }}>
          <h1 className="mb-4">About BadFish</h1>

          <p className="lead">
            BadFish is a fishing tracker for Final Fantasy XIV.
          </p>

          <hr className="my-4" />

          <h2 className="h4">Features</h2>

          <ul>
            <li>Browse fish and fishing locations</li>
            <li>Check the current Eorzea time</li>
            <li>Add fish to your tracker</li>
            <li>Mark fish as caught</li>
            <li>View market information for raiden</li>
          </ul>

          <h2 className="h4 mt-4">Project</h2>

          <p>
            The site was created as a React project using Vite, React Router and
            Bootstrap. XIVAPI supplies the fish catalogue.
            Universalis provides market prices for Raiden (Light).
          </p>
          <h3 className="h4 mt-4">About Me</h3>

          <p>Leanderson Costa Pacheco</p>
          <h2 className="h4 mt-4">GitHub</h2>
          <p>
            <a href="https://github.com/Waskarik">Waskarik on GitHub</a>
          </p>
        </div>
      </main>
    </>
  );
}

export default About;

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

          <p>
            It has a lighter version of the tracker it was inspired. The project
            helps to track fish, check their availability windows, track catches
            and view the current focus is the big fish for the arr achivments.
          </p>

          <hr className="my-4" />

          <h2 className="h4">Features</h2>

          <ul>
            <li>Browse fish and fishing locations</li>
            <li>Check Eorzea time availability</li>
            <li>Add fish to your tracker</li>
            <li>Mark fish as caught</li>
            <li>View market information</li>
          </ul>        

          <h2 className="h4 mt-4">Project</h2>

          <p>
            The site was created as a React project using Vite, React Router and
            Bootstrap, the fish data is stored locally, while a external API is
            used for aditional data such as live Market price from the Raiden(light) server.
          </p>
          <h3 className="h4 mt-4">About Me</h3>

          <p>Leanderson Costa Pacheco</p>
          <h2 className="h4 mt-4">GitHub</h2>
          <p>https://github.com/Waskarik</p>
        </div>
      </main>
    </>
  );
}

export default About;

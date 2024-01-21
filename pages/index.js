import { useState } from "react";
import Head from "next/head";
import Image from "next/image";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    description: '',
    styleType: '',
    colorPreference: '',
  })
  const imageStyle = {
    position: 'relative'
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prompt = `Extremely detailed tattoo masterpiece design:${form.description} with a ${form.styleType} design,
   against a clean and minimalist white background and a ${form.colorPreference} palette for the tattoo.
  `;
    console.log('prompt', prompt)
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      console.log({ prediction });
      setPrediction(prediction);
    }
  };

  return (
    <div className="container center h-90 mt-4">
      <Head>
        <title>AI-Generated Tattoos</title>
        {/* Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </Head>
      <div className="purple-bg row p-5">
        <h1 className="py-6 text-center font-bold text-2xl">
          <span className="gradient-text bolder">AI-Generated</span> Tattoos
        </h1>
        <div className="col-md-6 p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="description" className="form-label"
              >
                Describe your tattoo idea:
              </label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows="5"
                placeholder="A celestial clock with intricate gears and cogs, symbolizing the passage of time."
                required
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="style-type" className="form-label">Pick a style...</label>
              <select id="style-type" className="form-select" defaultValue={'traditional'} name="style-type" onChange={(e) => setForm({ ...form, styleType: e.target.value })}>
                <option value="traditional">Traditional</option>
                <option value="realism">Realism</option>
                <option value="neo-traditional">Neo-Traditional</option>
                <option value="watercolor">Watercolor</option>
                <option value="tribal">Tribal</option>
                <option value="geometric">Geometric</option>
                <option value="dotwork">Dotwork</option>
                <option value="new-school">New School</option>
                <option value="fine-line">Fine Line</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="color-preference" className="form-label"
              >
                Color Preference
              </label>
              <select
                id="color-preference"
                className="form-select"
                name="color-preference"
                onChange={(e) => setForm({ ...form, colorPreference: e.target.value })}
              >
                <option value="Colorful">Colorful</option>
                <option value="Black and Grey">Black and Grey</option>
                <option value="Black">Black</option>
              </select>
            </div>
            <div>
              <button id="btn-submit" type="submit" className="btn gradient-bg">
                Generate Tattoo
              </button>
              {prediction &&
                <p className="py-3 text-sm opacity-50">status: {prediction.status}</p>
              }
              <button
                id="btn-loading"
                className="btn gradient-bg border-0 hidden"
                type="button"
                disabled
              >
                <span
                  className="spinner-border spinner-border-sm"
                  aria-hidden="true"
                ></span>
                <span role="status">Generating Tattoo...</span>
              </button>
            </div>
            {/* <input
            type="text"
            className="flex-grow"
            name="prompt"
            placeholder="Enter a prompt to display an image"
          />
          <button className="button" type="submit">
            Go!
          </button> */}
          </form>
        </div>
        {error && <div>{error}</div>}
        <div
          className="col-md-6 p-4 d-flex align-items-center justify-content-center"
          id="append"
        >
          {/* container */}
          {prediction && (
            <>
              {prediction.output && (
                <div className="image-wrapper">
                  <Image
                    fill
                    className="img-fluid"
                    src={prediction.output[0]}
                    alt="output"
                  />
                </div>
              )}
            </>
          )}
          {prediction === null && (
            <div className="image-wrapper">
              <Image
                fill
                className="img-fluid"
                src="https://img.freepik.com/fotos-gratis/aguarela-da-textura-do-papel_1194-5420.jpg"
                alt="output"
                sizes="100%"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

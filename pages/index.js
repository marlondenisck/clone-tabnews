import React from "react";

function Home() {
  return (
    <>
      <main className="welcome-page">
        <header className="topbar">
          <div className="brand">tabnews</div>
          <button className="host-btn" type="button">
            Quero publicar
          </button>
        </header>

        <section className="hero">
          <p className="kicker">Bem-vindo(a)</p>
          <h1>Seu feed de tecnologia, comunidade e boas histórias.</h1>
          <p className="subtitle">
            Entre, compartilhe conhecimento e descubra pessoas construindo a
            internet brasileira com código aberto.
          </p>

          <div
            className="search-shell"
            role="search"
            aria-label="Entrar na plataforma"
          >
            <div className="search-copy">
              <strong>Pronto para começar?</strong>
              <span>Crie sua conta e personalize sua experiência.</span>
            </div>
            <button className="cta" type="button">
              Criar conta
            </button>
          </div>
        </section>

        <section className="features" aria-label="Destaques">
          <article className="feature-card">
            <h2>Conteudo de qualidade</h2>
            <p>
              Publicacoes da comunidade com foco em contexto real, discussao e
              aprendizado continuo.
            </p>
          </article>
          <article className="feature-card">
            <h2>Comunidade ativa</h2>
            <p>
              Interaja com pessoas desenvolvedoras de todo o pais e troque
              experiencia sem ruido.
            </p>
          </article>
          <article className="feature-card">
            <h2>Construcao aberta</h2>
            <p>
              Projeto aberto para evoluir junto com quem usa, testa e contribui
              todos os dias.
            </p>
          </article>
        </section>
      </main>

      <style jsx>{`
        :global(body) {
          margin: 0;
          background:
            radial-gradient(circle at 20% 0%, #fff4f6 0%, #ffffff 35%),
            linear-gradient(180deg, #ffffff 0%, #fffefe 100%);
          color: #222222;
          font-family:
            "Airbnb Cereal VF",
            Circular,
            -apple-system,
            system-ui,
            Roboto,
            "Helvetica Neue",
            sans-serif;
        }

        .welcome-page {
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 56px;
        }

        .brand {
          color: #ff385c;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.18px;
        }

        .host-btn {
          border: 0;
          border-radius: 999px;
          background: #f2f2f2;
          color: #222222;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 11px 18px;
          cursor: pointer;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .host-btn:hover {
          transform: translateY(-1px);
          box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 12px;
        }

        .hero {
          display: grid;
          gap: 18px;
          margin-bottom: 40px;
          animation: fadeUp 550ms ease both;
        }

        .kicker {
          margin: 0;
          display: inline-flex;
          width: fit-content;
          background: #ffe8ed;
          color: #e00b41;
          border-radius: 14px;
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.32px;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          max-width: 18ch;
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 1.08;
          font-weight: 700;
          letter-spacing: -0.44px;
        }

        .subtitle {
          margin: 0;
          max-width: 60ch;
          color: #6a6a6a;
          font-size: 1rem;
          line-height: 1.5;
        }

        .search-shell {
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: #ffffff;
          border-radius: 32px;
          padding: 16px 16px 16px 24px;
          box-shadow:
            rgba(0, 0, 0, 0.02) 0px 0px 0px 1px,
            rgba(0, 0, 0, 0.04) 0px 2px 6px,
            rgba(0, 0, 0, 0.1) 0px 4px 8px;
        }

        .search-copy {
          display: grid;
          gap: 4px;
        }

        .search-copy strong {
          font-size: 1rem;
          font-weight: 600;
        }

        .search-copy span {
          color: #6a6a6a;
          font-size: 0.88rem;
        }

        .cta {
          border: 0;
          border-radius: 999px;
          background: #ff385c;
          color: #ffffff;
          font-size: 1rem;
          font-weight: 600;
          padding: 12px 20px;
          cursor: pointer;
          transition:
            transform 180ms ease,
            filter 180ms ease;
          white-space: nowrap;
        }

        .cta:hover {
          filter: brightness(0.95);
          transform: translateY(-1px);
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .feature-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 20px;
          box-shadow:
            rgba(0, 0, 0, 0.02) 0px 0px 0px 1px,
            rgba(0, 0, 0, 0.04) 0px 2px 6px,
            rgba(0, 0, 0, 0.1) 0px 4px 8px;
          animation: fadeUp 550ms ease both;
        }

        .feature-card:nth-child(2) {
          animation-delay: 80ms;
        }

        .feature-card:nth-child(3) {
          animation-delay: 140ms;
        }

        h2 {
          margin: 0 0 8px;
          font-size: 1.2rem;
          line-height: 1.2;
          font-weight: 600;
          letter-spacing: -0.18px;
        }

        .feature-card p {
          margin: 0;
          color: #6a6a6a;
          font-size: 0.92rem;
          line-height: 1.45;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 949px) {
          .features {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 743px) {
          .welcome-page {
            padding: 18px;
          }

          .topbar {
            margin-bottom: 32px;
          }

          .search-shell {
            border-radius: 20px;
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
          }

          .cta {
            width: 100%;
          }

          .features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default Home;

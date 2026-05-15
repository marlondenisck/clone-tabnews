import React from "react";

function Home() {
  return (
    <main className="min-h-screen max-w-[1200px] mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-14 md:mb-8">
        <div className="text-[#ff385c] text-[1.4rem] font-bold tracking-[-0.18px]">
          tabnews
        </div>
        <button className="border-0 rounded-full bg-[#f2f2f2] text-[#222] text-[0.95rem] font-semibold px-5 py-2 cursor-pointer transition-transform transition-shadow duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          Quero publicar
        </button>
      </header>

      <section className="grid gap-4 mb-10 animate-fadeUp">
        <p className="inline-flex w-fit bg-[#ffe8ed] text-[#e00b41] rounded-[14px] px-3 py-1 text-xs font-bold uppercase tracking-wide">
          Bem-vindo(a)
        </p>
        <h1 className="m-0 max-w-[18ch] text-4xl md:text-3xl font-bold leading-tight tracking-[-0.44px]">
          Seu feed de tecnologia, comunidade e boas histórias.
        </h1>
        <p className="m-0 max-w-[60ch] text-[#6a6a6a] text-base leading-6">
          Entre, compartilhe conhecimento e descubra pessoas construindo a
          internet brasileira com código aberto.
        </p>

        <div
          className="mt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white rounded-full md:rounded-[32px] px-6 py-4 md:py-4 md:px-6 shadow-md"
          role="search"
          aria-label="Entrar na plataforma"
        >
          <div className="grid gap-1">
            <strong className="text-base font-semibold">
              Pronto para começar?
            </strong>
            <span className="text-[#6a6a6a] text-sm">
              Crie sua conta e personalize sua experiência.
            </span>
          </div>
          <button className="border-0 rounded-full bg-[#ff385c] text-white text-base font-semibold px-6 py-3 cursor-pointer transition-transform transition-filter duration-200 whitespace-nowrap w-full md:w-auto hover:brightness-95 hover:-translate-y-0.5">
            Criar conta
          </button>
        </div>
      </section>

      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        aria-label="Destaques"
      >
        <article className="bg-white rounded-2xl p-5 shadow-md animate-fadeUp">
          <h2 className="m-0 mb-2 text-lg font-semibold tracking-[-0.18px]">
            Conteúdo de qualidade
          </h2>
          <p className="m-0 text-[#6a6a6a] text-sm leading-[1.45]">
            Publicações da comunidade com foco em contexto real, discussão e
            aprendizado contínuo.
          </p>
        </article>
        <article
          className="bg-white rounded-2xl p-5 shadow-md animate-fadeUp"
          style={{ animationDelay: "80ms" }}
        >
          <h2 className="m-0 mb-2 text-lg font-semibold tracking-[-0.18px]">
            Comunidade ativa
          </h2>
          <p className="m-0 text-[#6a6a6a] text-sm leading-[1.45]">
            Interaja com pessoas desenvolvedoras de todo o país e troque
            experiência sem ruído.
          </p>
        </article>
        <article
          className="bg-white rounded-2xl p-5 shadow-md animate-fadeUp"
          style={{ animationDelay: "140ms" }}
        >
          <h2 className="m-0 mb-2 text-lg font-semibold tracking-[-0.18px]">
            Construção aberta
          </h2>
          <p className="m-0 text-[#6a6a6a] text-sm leading-[1.45]">
            Projeto aberto para evoluir junto com quem usa, testa e contribui
            todos os dias.
          </p>
        </article>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 550ms ease both; }
      `}</style>
    </main>
  );
}

export default Home;

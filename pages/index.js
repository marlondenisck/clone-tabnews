import React from "react";

function Home() {
  return (
    <div class="flex flex-col">
      <header class="flex flex-col w-full bg-white items-center">
        <nav class="flex w-full max-w-5xl space-x-2 justify-between py-2 px-5 md:px-10">
          <div class="flex items-center space-x-1 text-gray-800">
            <span class="text-md font-medium hidden md:block">TabNews</span>
          </div>
          <div class="flex space-x-2">
            <div>Acesse nossas redes:</div>
          </div>
        </nav>
      </header>
      <section class="flex flex-col w-full bg-white items-center">
        <div class="text-4xl flex-col w-full justify-center max-w-5xl pt-6 2xl:pt-8 pb-4 px-2">
          <h1 class="text-center flex-row font-medium pt-2 2xl:pt-4">
            Uma nova experiência está em construção
          </h1>
          <div class="text-center flex-row text-base pt-2 2xl:pt-4">
            Não fique de fora dessa, informe seu e-mail no campo abaixo e seja
            notificado assim que realizarmos o lançamento.
          </div>
          <div class="flex w-full justify-center pt-2 2xl:pt-4">
            <form class="text-center self-center flex text-base py-2 px-2 pl-4 border max-w-md rounded-full">
              <input
                class="flex-1 w-auto m-l"
                type="text"
                placeholder="Digite seu e-mail..."
                value=""
              />
              <button
                class="flex-1 bg-blue-500 text-white px-6 py-2 rounded-full"
                type="submit"
              >
                Enviar
              </button>
            </form>
          </div>
          <h1 class="text-center text-blue-400 flex-row font-medium pt-6 pb-0">
            Open Source À Vista 👀
          </h1>
        </div>
      </section>
    </div>
  );
}

export default Home;

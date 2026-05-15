import { useStatusQuery } from "@/hooks/use-status-query";

function formatDateToHuman(iso) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export function Status() {
  const { data, error, isLoading } = useStatusQuery();

  return (
    <main className="min-h-screen bg-white px-6 py-8 md:px-4 md:py-6">
      <div className="mx-auto max-w-150">
        <h1 className="mb-8 mt-0 font-sans text-[1.75rem] font-bold leading-[1.43] tracking-[-0.44px] text-[#222222] md:mb-6 md:text-2xl">
          Status da plataforma
        </h1>

        {isLoading && (
          <div className="rounded-[20px] bg-white p-8 shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.1)_0px_4px_8px] md:p-6">
            <p className="m-0 font-sans text-base leading-[1.43] text-[#6a6a6a]">
              Carregando informações...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-[20px] bg-white p-8 shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.1)_0px_4px_8px] md:p-6">
            <p className="m-0 font-sans text-base font-semibold leading-[1.43] text-[#c13515]">
              Falha ao buscar o status
            </p>
          </div>
        )}

        {data && (
          <div className="rounded-[20px] bg-white p-8 shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.1)_0px_4px_8px] md:p-6">
            <dl className="m-0 flex list-none flex-col gap-6 p-0 md:gap-5">
              <div className="border-b border-[rgba(0,0,0,0.08)] pb-4">
                <dt className="mb-2 font-sans text-[0.88rem] font-medium uppercase tracking-[0.32px] text-[#6a6a6a]">
                  Conexões em uso
                </dt>
                <dd className="m-0 font-sans text-base font-semibold leading-tight text-[#222222]">
                  {data.used_connections}
                </dd>
              </div>

              <div className="border-b border-[rgba(0,0,0,0.08)] pb-4">
                <dt className="mb-2 font-sans text-[0.88rem] font-medium uppercase tracking-[0.32px] text-[#6a6a6a]">
                  Máximo de conexões
                </dt>
                <dd className="m-0 font-sans text-base font-semibold leading-tight text-[#222222]">
                  {data.max_connections}
                </dd>
              </div>

              <div>
                <dt className="mb-2 font-sans text-[0.88rem] font-medium uppercase tracking-[0.32px] text-[#6a6a6a]">
                  Atualizado em
                </dt>
                <dd className="m-0 font-sans text-[0.88rem] font-medium leading-tight text-[#222222]">
                  {formatDateToHuman(data.update_at)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </main>
  );
}

export default Status;

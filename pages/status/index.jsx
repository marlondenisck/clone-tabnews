import useSWR from "swr";

async function fetcherAPI(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch status");
  }
  return response.json();
}

export function Status() {
  const { data, error, isLoading } = useSWR("/api/v1/status", fetcherAPI, {
    refreshInterval: 60000, // Atualiza a cada 60 segundos
  });

  const dateFormattedToHumans = (iso) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(iso));
  };

  return (
    <>
      <div className="welcome-page">
        <h1 className="title">Status da plataforma</h1>
        {isLoading && <p className="loading">Carregando...</p>}
        {error && <p className="error">Falha ao buscar o status</p>}
        {data && (
          <ul>
            <li>
              <strong>Used Connections:</strong> {data.used_connections}
            </li>
            <li>
              <strong>Max Connections:</strong> {data.max_connections}
            </li>
            <li>
              <strong>Updated At:</strong>{" "}
              {dateFormattedToHumans(data.update_at)}
            </li>
          </ul>
        )}
      </div>
    </>
  );
}

export default Status;

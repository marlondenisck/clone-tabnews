import useSWR from "swr";
import styles from "./status.module.css";

async function fetcherAPI(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch status");
  }
  return response.json();
}

function formatDateToHuman(iso) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export function Status() {
  const { data, error, isLoading } = useSWR("/api/v1/status", fetcherAPI, {
    refreshInterval: 60000,
  });

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Status da plataforma</h1>

        {isLoading && (
          <div className={styles.card}>
            <p className={styles.loading}>Carregando informações...</p>
          </div>
        )}

        {error && (
          <div className={styles.card}>
            <p className={styles.error}>Falha ao buscar o status</p>
          </div>
        )}

        {data && (
          <div className={styles.card}>
            <dl className={styles.statsList}>
              <div className={styles.statsItem}>
                <dt className={styles.label}>Conexões em uso</dt>
                <dd className={styles.value}>{data.used_connections}</dd>
              </div>

              <div className={styles.statsItem}>
                <dt className={styles.label}>Máximo de conexões</dt>
                <dd className={styles.value}>{data.max_connections}</dd>
              </div>

              <div className={styles.statsItem}>
                <dt className={styles.label}>Atualizado em</dt>
                <dd className={styles.valueTime}>
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

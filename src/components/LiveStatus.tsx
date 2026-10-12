import { useEffect, useState } from 'react';
import { KookeeApiError } from '@kookee/sdk';
import { KookeeProvider, useStatus, useStatusIncident } from '@kookee/react';
import { StatusHeadline, StatusIncidentArticle, StatusOverview } from '@kookee/react/status';

// The status pages are islands that read Kookee in the browser: a static build would show the
// status of the day it was built, and could not have a page for an incident that started later.
// Only strings cross into an island, so links are templates.

/** An incident id is a UUID; anything else is "not found" without a request. */
const INCIDENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The visitor's zone once the island runs in the browser; UTC while it renders at build time. */
function useTimeZone(): string {
  const [timeZone, setTimeZone] = useState('UTC');
  useEffect(() => setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone), []);
  return timeZone;
}

export function LiveStatusPage({ apiKey }: { apiKey: string }) {
  return (
    <KookeeProvider config={{ apiKey }}>
      <StatusContent />
    </KookeeProvider>
  );
}

function StatusContent() {
  // Refreshed every minute while the tab is visible: a status page is read during an incident.
  const { data: status, error } = useStatus({ refreshSeconds: 60 });
  const timeZone = useTimeZone();

  if (!status) {
    return <p className="site-lead">{error ? 'The status could not be loaded. Try again in a moment.' : 'Loading the status…'}</p>;
  }

  return (
    <>
      <StatusHeadline status={status} className="site-status-headline" />
      <p className="site-lead">Incidents, maintenance and the uptime of the last 90 days.</p>
      <StatusOverview status={status} incidentHref="/status/incident?id={id}" timeZone={timeZone} />
    </>
  );
}

export function LiveStatusIncident({ apiKey }: { apiKey: string }) {
  return (
    <KookeeProvider config={{ apiKey }}>
      <IncidentContent />
    </KookeeProvider>
  );
}

function IncidentContent() {
  // The id is in the query string, since a static site has no page per incident.
  const [id, setId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('id');
    setId(param && INCIDENT_ID_PATTERN.test(param) ? param : null);
  }, []);
  const { data: incident, error } = useStatusIncident(id ?? undefined, { refreshSeconds: 60 });
  const timeZone = useTimeZone();

  if (id === null || (error instanceof KookeeApiError && error.status === 404)) {
    return <p className="site-lead">This incident does not exist, or it is no longer public.</p>;
  }
  if (!incident) {
    return <p className="site-lead">{error ? 'The incident could not be loaded. Try again in a moment.' : 'Loading the incident…'}</p>;
  }

  return <StatusIncidentArticle incident={incident} timeZone={timeZone} />;
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { BacklogList, type BacklogItem } from "@/components/portal/BacklogList";

export default function BacklogPage() {
  const [backlog, setBacklog] = useState<BacklogItem[]>([]);
  const [readyForBls, setReadyForBls] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/portal/backlog");
    if (res.ok) {
      const data = await res.json();
      setBacklog(data.backlog ?? []);
      setReadyForBls(data.readyForBls ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchBacklog() {
      setLoading(true);
      const res = await fetch("/api/portal/backlog");
      if (!active) return;
      if (res.ok) {
        const data = await res.json();
        setBacklog(data.backlog ?? []);
        setReadyForBls(data.readyForBls ?? []);
      }
      setLoading(false);
    }
    void fetchBacklog();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-muted">Loading backlog…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Backlog</h1>
        <p className="mt-1 text-sm text-muted">
          Prioritize your queue and move items to the board when ready for Blue Lightning Services.
        </p>
      </div>

      <BacklogList
        title="Backlog"
        description="Rank items highest at the top. These are not yet on the delivery board."
        items={backlog}
        mode="backlog"
        onRefresh={load}
      />

      <BacklogList
        title="Ready for BLS"
        description="Items on the board in To Do — prioritized and ready for your engineering team to pick up."
        items={readyForBls}
        mode="ready"
        onRefresh={load}
      />
    </div>
  );
}

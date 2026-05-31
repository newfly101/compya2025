// useAdminWiki.js — ENC-A admin CRUD hooks
// admin viewer + POST/PUT/DELETE /api/admin/wiki/*

import { useState, useEffect, useCallback } from "react";
import { API } from "@/infra/http/client.js";

// ── admin viewer (is_active=false 도 포함) ────────────────────
export function useAdminWikiGameInfo(target) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    if (!target) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const { data: res } = await API.get(`/admin/wiki/game-info/${target.toUpperCase()}`);
      setData(res?.data ?? res);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [target]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, isLoading, isError, refetch: fetchData };
}

// ── 공통 mutation hook factory ────────────────────────────────
function useMutation(mutateFn, onSuccessRefetch) {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (payload, { onSuccess, onError } = {}) => {
    setIsPending(true);
    try {
      const result = await mutateFn(payload);
      if (onSuccessRefetch) await onSuccessRefetch();
      onSuccess?.(result);
    } catch (err) {
      onError?.(err);
    } finally {
      setIsPending(false);
    }
  }, [mutateFn, onSuccessRefetch]);

  return { mutate, isPending };
}

// ── wiki_pitch CRUD ───────────────────────────────────────────
export function useCreatePitch(refetch) {
  return useMutation(
    (body) => API.post("/admin/wiki/pitches", body).then((r) => r.data),
    refetch
  );
}

export function useUpdatePitch(refetch) {
  return useMutation(
    ({ id, ...body }) => API.put(`/admin/wiki/pitches/${id}`, body).then((r) => r.data),
    refetch
  );
}

export function useDeletePitch(refetch) {
  return useMutation(
    (id) => API.delete(`/admin/wiki/pitches/${id}`).then((r) => r.data),
    refetch
  );
}

// ── wiki_pitch_grade CRUD ─────────────────────────────────────
export function useCreatePitchGrade(refetch) {
  return useMutation(
    (body) => API.post("/admin/wiki/pitch-grades", body).then((r) => r.data),
    refetch
  );
}

export function useUpdatePitchGrade(refetch) {
  return useMutation(
    ({ id, ...body }) => API.put(`/admin/wiki/pitch-grades/${id}`, body).then((r) => r.data),
    refetch
  );
}

export function useDeletePitchGrade(refetch) {
  return useMutation(
    (id) => API.delete(`/admin/wiki/pitch-grades/${id}`).then((r) => r.data),
    refetch
  );
}

// ── wiki_stat_influence CRUD ──────────────────────────────────
export function useCreateStatInfluence(refetch) {
  return useMutation(
    (body) => API.post("/admin/wiki/stat-influences", body).then((r) => r.data),
    refetch
  );
}

export function useUpdateStatInfluence(refetch) {
  return useMutation(
    ({ id, ...body }) => API.put(`/admin/wiki/stat-influences/${id}`, body).then((r) => r.data),
    refetch
  );
}

export function useDeleteStatInfluence(refetch) {
  return useMutation(
    (id) => API.delete(`/admin/wiki/stat-influences/${id}`).then((r) => r.data),
    refetch
  );
}

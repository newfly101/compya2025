import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";

// 구 주소(/players/:teamId, /players/:teamId/:year) 진입 시 쿼리스트링 구조로 리다이렉트
export default function PlayersLegacyRedirect() {
  const { teamId, year } = useParams();
  return <Navigate to={ROUTE_PATHS.players_query({ team: teamId, year })} replace />;
}

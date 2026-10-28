"use client";

import { useEffect, useReducer } from "react";
import { demoReducer, initialDemoState } from "./demo-state";

export function useDemoSwarm() {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) dispatch({ type: "tick" });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!state.notice) return;
    const timer = setTimeout(() => dispatch({ type: "dismiss" }), 5000);
    return () => clearTimeout(timer);
  }, [state.notice]);
  return { state, dispatch };
}

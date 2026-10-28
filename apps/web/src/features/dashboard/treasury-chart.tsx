"use client";

import { useId, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  usePlotArea,
} from "recharts";
import { ChartNoAxesCombined, ChevronDown, Circle } from "lucide-react";
import {
  COMPUTE_RESERVE,
  demoTime,
  treasuryHistory,
  type Scenario,
} from "./demo-data";

const ranges = ["6H", "24H", "7D"] as const;
type Range = (typeof ranges)[number];

export function TreasuryChart({ scenario }: { scenario: Scenario }) {
  const [range, setRange] = useState<Range>("24H");
  const gradient = useId().replaceAll(":", "");
  const offline = scenario === "offline";
  const history = treasuryHistory(scenario, range);
  const current = history.at(-1)?.balance ?? 0;
  const starting = history[0]?.balance ?? 0;
  const change = current - starting;
  const max = scenario === "funded" ? 30 : 10;
  const axisTime = (value: number) =>
    range === "7D"
      ? new Date(value).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        })
      : demoTime(value);

  return (
    <section className="sc-panel sc-treasury" aria-labelledby="treasury-title">
      <div className="sc-panel-heading">
        <div>
          <h2 id="treasury-title">Treasury history</h2>
        </div>
        <div className="sc-range" role="group" aria-label="Chart time range">
          {ranges.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={range === value}
              onClick={() => setRange(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="sc-chart-summary">
        <strong>
          {offline ? "—" : current.toFixed(2)} <span>NEAR</span>
        </strong>
        <span
          className={`sc-chart-change${!offline && change < 0 ? " is-negative" : ""}`}
        >
          {offline
            ? "Waiting for data"
            : `${change >= 0 ? "+" : ""}${change.toFixed(2)} NEAR over ${range === "7D" ? "7 days" : range === "6H" ? "6 hours" : "24 hours"}`}
        </span>
      </div>
      {offline ? (
        <div className="sc-chart-empty">
          <ChartNoAxesCombined size={34} strokeWidth={1.3} />
          <strong>Your treasury history will appear here.</strong>
          <p>No swarm data is connected in this preview state.</p>
        </div>
      ) : (
        <div
          className="sc-chart"
          role="group"
          aria-label={`Sample treasury over ${range}. Current balance ${current.toFixed(2)} NEAR. Compute reserve ${COMPUTE_RESERVE} NEAR. Use arrow keys to explore the chart, or expand its data table below.`}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            initialDimension={{ width: 700, height: 240 }}
          >
            <AreaChart
              data={history}
              margin={{ top: 12, right: 8, bottom: 0, left: -24 }}
              accessibilityLayer
            >
              <ReserveGradients id={gradient} max={max} />
              <CartesianGrid
                vertical={false}
                stroke="#e6e9e5"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={axisTime}
                minTickGap={36}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#757a74", fontSize: 11 }}
                dy={9}
              />
              <YAxis
                domain={[0, max]}
                ticks={scenario === "funded" ? [0, 10, 20, 30] : [0, 5, 10]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#757a74", fontSize: 11 }}
              />
              <Tooltip
                content={({
                  active,
                  payload,
                }: {
                  active?: boolean;
                  payload?: ReadonlyArray<{
                    payload?: { timestamp: number; balance: number };
                  }>;
                }) => {
                  const point = payload?.[0]?.payload as
                    { timestamp: number; balance: number } | undefined;
                  return active && point ? (
                    <div className="sc-chart-tooltip">
                      <span>{axisTime(point.timestamp)} UTC · Sample</span>
                      <strong>{point.balance.toFixed(2)} NEAR</strong>
                    </div>
                  ) : null;
                }}
                cursor={{ stroke: "#a2aaa0", strokeDasharray: "3 4" }}
              />
              <ReferenceLine
                y={COMPUTE_RESERVE}
                stroke="#9a8179"
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="balance"
                name="Treasury"
                stroke={`url(#line-${gradient})`}
                strokeWidth={2.5}
                fill={`url(#area-${gradient})`}
                isAnimationActive={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 3,
                  stroke: "#fff",
                  fill: "#16933a",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="sc-chart-footer">
        <span>
          <Circle size={8} fill="#16933a" stroke="none" /> Treasury balance
        </span>
        <span>
          <i /> Compute reserve · 4 NEAR
        </span>
      </div>
      {!offline && (
        <details className="sc-chart-data">
          <summary>
            View sample chart data <ChevronDown size={14} />
          </summary>
          <div className="sc-chart-data-scroll">
            <table>
              <caption>Sample treasury values, timestamps in UTC</caption>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Balance</th>
                </tr>
              </thead>
              <tbody>
                {history.map((point) => (
                  <tr key={point.timestamp}>
                    <td>{axisTime(point.timestamp)}</td>
                    <td>{point.balance.toFixed(2)} NEAR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}

function ReserveGradients({ id, max }: { id: string; max: number }) {
  const plot = usePlotArea();
  if (!plot) return null;
  const threshold = (max - COMPUTE_RESERVE) / max;
  const coordinates = {
    gradientUnits: "userSpaceOnUse" as const,
    x1: 0,
    x2: 0,
    y1: plot.y,
    y2: plot.y + plot.height,
  };
  return (
    <defs>
      <linearGradient id={`area-${id}`} {...coordinates}>
        <stop offset="0" stopColor="#05c92f" stopOpacity={0.19} />
        <stop offset={threshold} stopColor="#05c92f" stopOpacity={0.04} />
        <stop offset={threshold} stopColor="#dc5c4d" stopOpacity={0.08} />
        <stop offset="1" stopColor="#dc5c4d" stopOpacity={0.16} />
      </linearGradient>
      <linearGradient id={`line-${id}`} {...coordinates}>
        <stop offset={threshold} stopColor="#16933a" />
        <stop offset={threshold} stopColor="#ca4a3c" />
      </linearGradient>
    </defs>
  );
}

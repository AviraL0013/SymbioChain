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
} from "recharts";
import { ChartNoAxesCombined, ChevronDown, Circle } from "lucide-react";
import type { ViewerSnapshot } from "@symbiochain/shared";
import { formatAtoms, timestamp } from "@/features/swarm/format";

const ranges = ["6H", "24H", "7D"] as const;
export function TreasuryChart({ data }: { data: ViewerSnapshot | null }) {
  const [range, setRange] = useState<(typeof ranges)[number]>("24H");
  const gradient = useId().replaceAll(":", "");
  const treasury = data?.treasury;
  const hours = range === "6H" ? 6 : range === "24H" ? 24 : 168;
  const cutoff = data ? Date.parse(data.capturedAt) - hours * 3600000 : 0;
  const points = data?.history ?? [];
  const visible = points.filter(
    (point) => Date.parse(point.timestamp) >= cutoff,
  );
  const history = visible.map((point) => ({
    ...point,
    time: Date.parse(point.timestamp),
    balance: Number(point.balanceAtoms) / 10 ** (treasury?.decimals ?? 0),
  }));
  const reserve = treasury
    ? Number(treasury.minReserveAtoms) / 10 ** treasury.decimals
    : 0;
  return (
    <section className="sc-panel sc-treasury" aria-labelledby="treasury-title">
      <div className="sc-panel-heading">
        <h2 id="treasury-title">Treasury history</h2>
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
          {formatAtoms(treasury?.balanceAtoms, treasury?.decimals ?? 0)}{" "}
          <span>{treasury?.asset ?? "—"}</span>
        </strong>
        <span className="sc-chart-change">
          Includes external funding. Balance changes are not profit.
        </span>
      </div>
      {!history.length ? (
        <div className="sc-chart-empty">
          <ChartNoAxesCombined size={34} />
          <strong>Your treasury history will appear here.</strong>
          <p>Waiting for recorded ledger values.</p>
        </div>
      ) : (
        <div
          className="sc-chart"
          role="group"
          aria-label="PAPER treasury ledger history. Exact values are available in the data table."
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
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#05c92f" stopOpacity={0.19} />
                  <stop offset="100%" stopColor="#05c92f" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#e6e9e5"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="time"
                tickFormatter={(value) =>
                  timestamp(new Date(value).toISOString())
                }
                minTickGap={36}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#757a74", fontSize: 11 }}
              />
              <YAxis
                domain={[0, "auto"]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#757a74", fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  const point = payload?.[0]?.payload as
                    (typeof history)[number] | undefined;
                  return active && point ? (
                    <div className="sc-chart-tooltip">
                      <span>{timestamp(point.timestamp)} UTC</span>
                      <strong>
                        {formatAtoms(
                          point.balanceAtoms,
                          treasury?.decimals ?? 0,
                        )}{" "}
                        {treasury?.asset}
                      </strong>
                    </div>
                  ) : null;
                }}
              />
              <ReferenceLine
                y={reserve}
                stroke="#9a8179"
                strokeDasharray="5 5"
              />
              <Area
                type="stepAfter"
                dataKey="balance"
                name="Treasury"
                stroke="#16933a"
                strokeWidth={2.5}
                fill={`url(#${gradient})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="sc-chart-footer">
        <span>
          <Circle size={8} fill="#16933a" stroke="none" />
          Treasury balance
        </span>
        <span>
          <i />
          Policy reserve ·{" "}
          {formatAtoms(treasury?.minReserveAtoms, treasury?.decimals ?? 0)}{" "}
          {treasury?.asset}
        </span>
      </div>
      <p className="sc-agent-note">
        Gross trading P&amp;L:{" "}
        {formatAtoms(treasury?.grossTradingPnlAtoms, treasury?.decimals ?? 0)}{" "}
        {treasury?.asset}. Costs and funding are not included in gross P&amp;L.
      </p>
      {!!history.length && (
        <details className="sc-chart-data">
          <summary>
            View recorded chart data <ChevronDown size={14} />
          </summary>
          <div className="sc-chart-data-scroll">
            <table>
              <caption>
                Hourly PAPER ledger observations, timestamps in UTC
              </caption>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Balance</th>
                </tr>
              </thead>
              <tbody>
                {history.map((point) => (
                  <tr key={point.timestamp}>
                    <td>{timestamp(point.timestamp)}</td>
                    <td>
                      {formatAtoms(point.balanceAtoms, treasury?.decimals ?? 0)}{" "}
                      {treasury?.asset}
                    </td>
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

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  BoatKeys,
  BombKeys,
  BuildingKeys,
  PlayerStats,
} from "../../../core/StatsSchemas";
import { renderNumber, translateText } from "../../Utils";

@customElement("player-stats-table")
export class PlayerStatsTable extends LitElement {
  static styles = css`
    .table-container {
      margin-top: 1rem;
      width: 100%;
      max-width: 28rem;
    }
    table {
      width: 100%;
      font-size: 0.95rem;
      color: #ccc;
      border-collapse: collapse;
    }
    th,
    td {
      padding: 0.25rem 0.5rem;
      text-align: center;
    }
    th {
      color: #bbb;
      font-weight: 600;
    }
    .section-title {
      color: #888;
      font-size: 1rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
  `;

  @property({ type: Object }) stats: PlayerStats;

  render() {
    const stats = this.stats;

    return html`
      <div class="table-container">
        <div class="section-title">🏗️ Building Statistics</div>
        <table>
          <thead>
            <tr>
              <th class="text-left">Building</th>
              <th>Built</th>
              <th>Destroyed</th>
              <th>Captured</th>
              <th>Lost</th>
            </tr>
          </thead>
          <tbody>
            ${BuildingKeys.map((key) => {
              const built = stats?.units?.[key]?.[0] ?? 0n;
              const destroyed = stats?.units?.[key]?.[1] ?? 0n;
              const captured = stats?.units?.[key]?.[2] ?? 0n;
              const lost = stats?.units?.[key]?.[3] ?? 0n;
              return html`
                <tr>
                  <td>${translateText(`something.${key}`)}</td>
                  <td>${renderNumber(built)}</td>
                  <td>${renderNumber(destroyed)}</td>
                  <td>${renderNumber(captured)}</td>
                  <td>${renderNumber(lost)}</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>

      <div class="table-container">
        <div class="section-title">🚢 Ship Arrivals</div>
        <table>
          <thead>
            <tr>
              <th class="text-left">Ship Type</th>
              <th>Sent</th>
              <th>Destroyed</th>
              <th>Arrived</th>
            </tr>
          </thead>
          <tbody>
            ${BoatKeys.map((key) => {
              const sent = stats?.boats?.[key]?.[0] ?? 0n;
              const arrived = stats?.boats?.[key]?.[1] ?? 0n;
              const destroyed = stats?.boats?.[key]?.[3] ?? 0n;
              return html`
                <tr>
                  <td>${translateText(`something.${key}`)}</td>
                  <td>${renderNumber(sent)}</td>
                  <td>${renderNumber(destroyed)}</td>
                  <td>${renderNumber(arrived)}</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>

      <div class="table-container">
        <div class="section-title">☢️ Nuke Statistics</div>
        <table>
          <thead>
            <tr>
              <th class="text-left" style="width:40%">Weapon</th>
              <th class="text-center" style="width:20%">Built</th>
              <th class="text-center" style="width:20%">Destroyed</th>
              <th class="text-center" style="width:20%">Hits</th>
            </tr>
          </thead>
          <tbody>
            ${BombKeys.map((bomb) => {
              const launched = stats?.bombs?.[bomb]?.[0] ?? 0n;
              const landed = stats?.bombs?.[bomb]?.[1] ?? 0n;
              const intercepted = stats?.bombs?.[bomb]?.[2] ?? 0n;
              return html`
                <tr>
                  <td>${translateText(`something.${bomb}`)}</td>
                  <td class="text-center">${renderNumber(launched)}</td>
                  <td class="text-center">${renderNumber(landed)}</td>
                  <td class="text-center">${renderNumber(intercepted)}</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>

      <div class="table-container">
        <div class="section-title">📊 Player Metrics</div>
        <table>
          <thead>
            <tr>
              <th>attack</th>
              <th>sent</th>
              <th>received</th>
              <th>cancelled</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Count</td>
              <td>${renderNumber(stats?.attacks?.[0] ?? 0n)}</td>
              <td>${renderNumber(stats?.attacks?.[1] ?? 0n)}</td>
              <td>${renderNumber(stats?.attacks?.[2] ?? 0n)}</td>
            </tr>
          </tbody>
        </table>
        <table style="margin-top: 0.75rem;">
          <thead>
            <tr>
              <th>gold</th>
              <th>workers</th>
              <th>war</th>
              <th>trade</th>
              <th>steal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Count</td>
              <td>${renderNumber(stats?.gold?.[0] ?? 0n)}</td>
              <td>${renderNumber(stats?.gold?.[1] ?? 0n)}</td>
              <td>${renderNumber(stats?.gold?.[2] ?? 0n)}</td>
              <td>${renderNumber(stats?.gold?.[3] ?? 0n)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
}

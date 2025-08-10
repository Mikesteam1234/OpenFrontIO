import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { PlayerStats } from "../../../core/StatsSchemas";

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

  private getBuildingName(key: string): string {
    const names: Record<string, string> = {
      // buildings
      city: "City",
      port: "Port",
      defp: "Defense",
      saml: "SAM",
      silo: "Missile Silo",
      // boats
      trade: "Trade Ship",
      trans: "Transport Ship",
      wshp: "Warship",
      // bombs
      abomb: "Atom Bomb",
      hbomb: "Hydrogen Bomb",
      mirv: "MIRV",
    };
    return names[key] ?? key;
  }

  render() {
    const stats = this.stats;

    const buildingKeys = ["city", "port", "defp", "saml", "silo"];
    const boatKeys = ["trade", "trans", "wshp"];
    const bombKeys = ["abomb", "hbomb", "mirv"];

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
            ${buildingKeys.map((key) => {
              const arr = (stats?.units ?? {})[key] ?? [0, 0, 0, 0];
              const [built, destroyed, captured, lost] = arr.map(Number);
              return html`
                <tr>
                  <td>${this.getBuildingName(key)}</td>
                  <td>${built ?? 0}</td>
                  <td>${destroyed ?? 0}</td>
                  <td>${captured ?? 0}</td>
                  <td>${lost ?? 0}</td>
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
            ${boatKeys.map((key) => {
              const arr = (stats?.boats ?? {})[key] ?? [0, 0, 0, 0];
              const [sent, arrived, _captured, destroyed] = arr.map(Number);
              return html`
                <tr>
                  <td>${this.getBuildingName(key)}</td>
                  <td>${sent ?? 0}</td>
                  <td>${destroyed ?? 0}</td>
                  <td>${arrived ?? 0}</td>
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
            ${bombKeys.map((bomb) => {
              const arr = (stats?.bombs ?? {})[bomb] ?? [0, 0, 0];
              const [launched, landed, intercepted] = arr.map(Number);
              return html`
                <tr>
                  <td>${this.getBuildingName(bomb)}</td>
                  <td class="text-center">${launched ?? 0}</td>
                  <td class="text-center">${landed ?? 0}</td>
                  <td class="text-center">${intercepted ?? 0}</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    `;
  }
}

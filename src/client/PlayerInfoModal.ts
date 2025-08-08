import { html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { UserMeResponse } from "../core/ApiSchemas";

type BuildingStat = {
  built: number;
  destroyed: number;
  lost: number;
  captured: number;
};
type ShipStat = { sent: number; destroyed: number; arrived: number };
type NukeStat = { built: number; destroyed: number; hits: number };

type AllBuildingStats = {
  city: BuildingStat;
  port: BuildingStat;
  defense: BuildingStat;
  sam: BuildingStat;
  silo: BuildingStat;
  warship: ShipStat;
  transportShip: ShipStat;
  tradeShip: ShipStat;
  atom: NukeStat;
  hydrogen: NukeStat;
  mirv: NukeStat;
};

@customElement("player-info-modal")
export class PlayerInfoModal extends LitElement {
  @query("o-modal") private modalEl!: HTMLElement & {
    open: () => void;
    close: () => void;
  };

  @state() private playerName: string = "";
  @state() private discordName: string = "";
  @state() private playerAvatarUrl: string = "";
  @state() private flag: string = "";
  @state() private publicId: string = "";

  @state() private wins: number = 57;
  @state() private playTimeSeconds: number = 5 * 3600 + 33 * 60;
  @state() private progressPercent: number = 62;
  @state() private gamesPlayed: number = 119;
  @state() private losses: number = 62;
  @state() private lastActive: string = "1992/4/27";

  @state() private buildingStatsPublic: AllBuildingStats = {
    city: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    port: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    defense: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    sam: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    silo: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    warship: { sent: 0, destroyed: 0, arrived: 0 },
    transportShip: { sent: 0, destroyed: 0, arrived: 0 },
    tradeShip: { sent: 0, destroyed: 0, arrived: 0 },
    atom: { built: 0, destroyed: 0, hits: 0 },
    hydrogen: { built: 0, destroyed: 0, hits: 0 },
    mirv: { built: 0, destroyed: 0, hits: 0 },
  };
  @state() private buildingStatsPrivate: AllBuildingStats = {
    city: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    port: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    defense: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    sam: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    silo: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    warship: { sent: 0, destroyed: 0, arrived: 0 },
    transportShip: { sent: 0, destroyed: 0, arrived: 0 },
    tradeShip: { sent: 0, destroyed: 0, arrived: 0 },
    atom: { built: 0, destroyed: 0, hits: 0 },
    hydrogen: { built: 0, destroyed: 0, hits: 0 },
    mirv: { built: 0, destroyed: 0, hits: 0 },
  };
  @state() private buildingStatsAll: AllBuildingStats = {
    city: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    port: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    defense: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    sam: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    silo: { built: 0, destroyed: 0, lost: 0, captured: 0 },
    warship: { sent: 0, destroyed: 0, arrived: 0 },
    transportShip: { sent: 0, destroyed: 0, arrived: 0 },
    tradeShip: { sent: 0, destroyed: 0, arrived: 0 },
    atom: { built: 0, destroyed: 0, hits: 0 },
    hydrogen: { built: 0, destroyed: 0, hits: 0 },
    mirv: { built: 0, destroyed: 0, hits: 0 },
  };
  @state() private visibility: "all" | "public" | "private" = "all";
  @state() private totalsByVisibility: Record<
    "all" | "public" | "private",
    { wins: number; losses: number; total: number }
  > = {
    all: { wins: 0, losses: 0, total: 0 },
    public: { wins: 0, losses: 0, total: 0 },
    private: { wins: 0, losses: 0, total: 0 },
  };

  @state() private recentGames: {
    gameId: string;
    start: string;
    map: string;
    difficulty: string;
    type: string;
    won: boolean;
    gameMode: "ffa" | "team";
    teamCount?: number;
    teamColor?: string;
  }[] = [
    {
      gameId: "tGadjhgg",
      start: "2025-08-08T10:00:00Z",
      map: "Australia",
      difficulty: "Medium",
      type: "Public",
      won: true,
      gameMode: "ffa",
    },
    {
      gameId: "I7XQ63rt",
      start: "2025-08-07T09:00:00Z",
      map: "Baikal",
      difficulty: "Medium",
      type: "Public",
      won: false,
      gameMode: "team",
      teamCount: 2,
      teamColor: "blue",
    },
    {
      gameId: "Chocolat",
      start: "2025-08-06T11:30:00Z",
      map: "World",
      difficulty: "Medium",
      type: "Private",
      won: true,
      gameMode: "team",
      teamCount: 3,
      teamColor: "red",
    },
  ];

  @state() private expandedGameId: string | null = null;

  private viewGame(gameId: string): void {
    console.log("Viewing game:", gameId); //openfront.io/game/#join={gameID}}
  }

  private toggleGameDetails(gameId: string): void {
    this.expandedGameId = this.expandedGameId === gameId ? null : gameId;
  }

  private formatPlayTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }

  createRenderRoot() {
    return this;
  }

  private getStoredFlag(): string {
    const storedFlag = localStorage.getItem("flag");
    return storedFlag ?? "";
  }

  private getStoredName(): string {
    const storedName = localStorage.getItem("username");
    return storedName ?? "";
  }

  private getBuildingName(building: string): string {
    const buildingNames: Record<string, string> = {
      city: "City",
      port: "Port",
      defense: "Defense",
      warship: "Warship",
      atom: "Atom Bomb",
      hydrogen: "Hydrogen Bomb",
      mirv: "MIRV",
      silo: "Missile Silo",
      sam: "SAM",
      transportShip: "Transport Ship",
      tradeShip: "Trade Ship",
    };
    return buildingNames[building] || building;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  private getDisplayedBuildingStats(): AllBuildingStats {
    switch (this.visibility) {
      case "public":
        return this.buildingStatsPublic;
      case "private":
        return this.buildingStatsPrivate;
      default:
        return this.buildingStatsAll;
    }
  }
  private setVisibility(v: "all" | "public" | "private") {
    this.visibility = v;
    const t = this.totalsByVisibility[v];
    this.wins = t.wins;
    this.losses = t.losses;
    this.gamesPlayed = t.total;
    this.requestUpdate();
  }

  private applyBackendStats(rawStats: any): void {
    const pub = rawStats?.Public?.["Free For All"]?.Medium;
    const prv = rawStats?.Private?.["Free For All"]?.Medium;

    const add4 = (dst: number[], src: string[] = ["0", "0", "0", "0"]) => {
      for (let i = 0; i < 4; i++) dst[i] = (dst[i] ?? 0) + Number(src[i] ?? 0);
    };
    const add3 = (dst: number[], src: string[] = ["0", "0", "0"]) => {
      for (let i = 0; i < 3; i++) dst[i] = (dst[i] ?? 0) + Number(src[i] ?? 0);
    };
    const toShip3 = (arr: string[] = ["0", "0", "0", "0"]) =>
      arr.slice(0, 3) as string[];

    const aggregateFromBranch = (br: any) => {
      const units: Record<string, number[]> = {};
      const boats: Record<string, number[]> = {};
      const bombs: Record<string, number[]> = {};
      let wins = 0,
        losses = 0,
        total = 0;

      if (br) {
        wins += Number(br.wins ?? 0);
        losses += Number(br.losses ?? 0);
        total += Number(br.total ?? 0);

        Object.entries(br.stats?.units ?? {}).forEach(([k, arr]) => {
          if (!units[k]) units[k] = [0, 0, 0, 0];
          add4(units[k], arr as string[]);
        });
        Object.entries(br.stats?.boats ?? {}).forEach(([k, arr]) => {
          if (!boats[k]) boats[k] = [0, 0, 0];
          add3(boats[k], toShip3(arr as string[]));
        });
        Object.entries(br.stats?.bombs ?? {}).forEach(([k, arr]) => {
          if (!bombs[k]) bombs[k] = [0, 0, 0];
          add3(bombs[k], arr as string[]);
        });
      }
      return { units, boats, bombs, wins, losses, total };
    };

    const pubAgg = aggregateFromBranch(pub);
    const prvAgg = aggregateFromBranch(prv);

    const sumAgg = (a: any, b: any) => {
      const outUnits: Record<string, number[]> = {};
      const outBoats: Record<string, number[]> = {};
      const outBombs: Record<string, number[]> = {};
      const keys = new Set([...Object.keys(a.units), ...Object.keys(b.units)]);
      keys.forEach((k) => {
        outUnits[k] = [0, 0, 0, 0];
        add4(outUnits[k], a.units[k] as any);
        add4(outUnits[k], b.units[k] as any);
      });
      const keysB = new Set([...Object.keys(a.boats), ...Object.keys(b.boats)]);
      keysB.forEach((k) => {
        outBoats[k] = [0, 0, 0];
        add3(outBoats[k], a.boats[k] as any);
        add3(outBoats[k], b.boats[k] as any);
      });
      const keysC = new Set([...Object.keys(a.bombs), ...Object.keys(b.bombs)]);
      keysC.forEach((k) => {
        outBombs[k] = [0, 0, 0];
        add3(outBombs[k], a.bombs[k] as any);
        add3(outBombs[k], b.bombs[k] as any);
      });
      return {
        units: outUnits,
        boats: outBoats,
        bombs: outBombs,
        wins: a.wins + b.wins,
        losses: a.losses + b.losses,
        total: a.total + b.total,
      };
    };

    const allAgg = sumAgg(pubAgg, prvAgg);

    const shapeFromAgg = (agg: any): AllBuildingStats => {
      const get4 = (k: string) =>
        (agg.units[k] ?? [0, 0, 0, 0]) as [number, number, number, number];
      const get3 = (k: string) =>
        (agg.bombs[k] ?? [0, 0, 0]) as [number, number, number];
      const getShip = (k: string) =>
        (agg.boats[k] ?? [0, 0, 0]) as [number, number, number];

      const [cityB, cityD, cityL, cityC] = get4("city");
      const [defB, defD, defL, defC] = get4("defp");
      const [portB, portD, portL, portC] = get4("port");
      const [samB, samD, samL, samC] = get4("saml");
      const [siloB, siloD, siloL, siloC] = get4("silo");

      const [atomB, atomD, atomH] = get3("abomb");
      const [hydB, hydD, hydH] = get3("hbomb");
      const [mirvB, mirvD, mirvH] = get3("mirv");

      const [transS, transD, transA] = getShip("trans");
      const [tradeS, tradeD, tradeA] = getShip("trade");
      const [warS, warD, warA] = getShip("wshp");

      return {
        city: { built: cityB, destroyed: cityD, captured: cityC, lost: cityL },
        port: { built: portB, destroyed: portD, captured: portC, lost: portL },
        defense: { built: defB, destroyed: defD, captured: defC, lost: defL },
        sam: { built: samB, destroyed: samD, captured: samC, lost: samL },
        silo: { built: siloB, destroyed: siloD, captured: siloL, lost: siloC },
        warship: { sent: warS, destroyed: warD, arrived: warA },
        transportShip: { sent: transS, destroyed: transD, arrived: transA },
        tradeShip: { sent: tradeS, destroyed: tradeD, arrived: tradeA },
        atom: { built: atomB, destroyed: atomD, hits: atomH },
        hydrogen: { built: hydB, destroyed: hydD, hits: hydH },
        mirv: { built: mirvB, destroyed: mirvD, hits: mirvH },
      };
    };

    this.buildingStatsPublic = shapeFromAgg(pubAgg);
    this.buildingStatsPrivate = shapeFromAgg(prvAgg);
    this.buildingStatsAll = shapeFromAgg(allAgg);

    this.totalsByVisibility = {
      all: { wins: allAgg.wins, losses: allAgg.losses, total: allAgg.total },
      public: { wins: pubAgg.wins, losses: pubAgg.losses, total: pubAgg.total },
      private: {
        wins: prvAgg.wins,
        losses: prvAgg.losses,
        total: prvAgg.total,
      },
    };

    const t = this.totalsByVisibility[this.visibility];
    this.wins = t.wins;
    this.losses = t.losses;
    this.gamesPlayed = t.total;

    this.requestUpdate();
  }

  render() {
    this.flag = this.getStoredFlag();
    this.playerName = this.getStoredName();
    return html`
      <o-modal id="playerInfoModal" title="Player Info" alwaysMaximized>
        <div class="flex flex-col items-center mt-2 mb-4">
          <br />
          <div class="flex items-center gap-2">
            <!-- Flag -->
            <div class="p-[3px] rounded-full bg-gray-500">
              <img
                class="size-[48px] rounded-full block"
                src="/flags/${this.flag ?? "xx"}.svg"
                alt="Flag"
              />
            </div>

            <!-- Names -->
            <span class="font-semibold">${this.playerName}</span>
            <span>|</span>
            <span class="font-semibold">${this.discordName}</span>

            <!-- Avatar -->
            ${this.playerAvatarUrl
              ? html`
                  <div class="p-[3px] rounded-full bg-gray-500">
                    <img
                      class="size-[48px] rounded-full block"
                      src="${this.playerAvatarUrl}"
                      alt="Avatar"
                    />
                  </div>
                `
              : null}
          </div>
          <!-- Visibility toggle under names -->
          <div class="flex gap-2 mt-2">
            <button
              class="text-xs px-2 py-0.5 rounded border ${this.visibility ===
              "all"
                ? "border-white/60 text-white"
                : "border-white/20 text-gray-300"}"
              @click=${() => this.setVisibility("all")}
            >
              All
            </button>
            <button
              class="text-xs px-2 py-0.5 rounded border ${this.visibility ===
              "public"
                ? "border-white/60 text-white"
                : "border-white/20 text-gray-300"}"
              @click=${() => this.setVisibility("public")}
            >
              Public
            </button>
            <button
              class="text-xs px-2 py-0.5 rounded border ${this.visibility ===
              "private"
                ? "border-white/60 text-white"
                : "border-white/20 text-gray-300"}"
              @click=${() => this.setVisibility("private")}
            >
              Private
            </button>
          </div>

          <hr class="w-2/3 border-gray-600 my-2" />

          <div
            class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-white text-center mb-2"
          >
            <div>
              <div class="text-xl font-semibold">${this.wins ?? 0}</div>
              <div class="text-gray-400">Wins</div>
            </div>
            <div>
              <div class="text-xl font-semibold">${this.losses}</div>
              <div class="text-gray-400">Losses</div>
            </div>
            <div>
              <div class="text-xl font-semibold">
                ${((this.wins / this.gamesPlayed) * 100).toFixed(1)}%
              </div>
              <div class="text-gray-400">Win Rate</div>
            </div>
            <div>
              <div class="text-xl font-semibold">${this.gamesPlayed}</div>
              <div class="text-gray-400">Games Played</div>
            </div>
            <div>
              <div class="text-xl font-semibold">
                ${this.playTimeSeconds
                  ? this.formatPlayTime(this.playTimeSeconds)
                  : "0h 0m"}
              </div>
              <div class="text-gray-400">Play Time</div>
            </div>
            <div>
              <div class="text-xl font-semibold">${this.lastActive}</div>
              <div class="text-gray-400">Last Active</div>
            </div>
          </div>

          <hr class="w-2/3 border-gray-600 my-2" />

          <hr class="w-2/3 border-gray-600 my-2" />

          <div class="mt-4 w-full max-w-md">
            <div class="text-sm text-gray-400 font-semibold mb-1">
              🏗️ Building Statistics
            </div>
            <table class="w-full text-sm text-gray-300 border-collapse">
              <thead>
                <tr class="border-b border-gray-600">
                  <th class="text-left w-1/5">Building</th>
                  <th class="text-center w-1/5">Built</th>
                  <th class="text-center w-1/5">Destroyed</th>
                  <th class="text-center w-1/5">Captured</th>
                  <th class="text-center w-1/5">Lost</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  const bs = this.getDisplayedBuildingStats();
                  return Object.entries(bs)
                    .filter(([b]) =>
                      ["city", "port", "defense", "sam"].includes(b),
                    )
                    .map(([building, stats]) => {
                      const typedStats = stats as BuildingStat;
                      return html`
                        <tr>
                          <td>${this.getBuildingName(building)}</td>
                          <td class="text-center">${typedStats.built ?? 0}</td>
                          <td class="text-center">
                            ${typedStats.destroyed ?? 0}
                          </td>
                          <td class="text-center">
                            ${typedStats.captured ?? 0}
                          </td>
                          <td class="text-center">${typedStats.lost ?? 0}</td>
                        </tr>
                      `;
                    });
                })()}
              </tbody>
            </table>
          </div>

          <div class="mt-4 w-full max-w-md">
            <div class="text-sm text-gray-400 font-semibold mb-1">
              🚢 Ship Arrivals
            </div>
            <table class="w-full text-sm text-gray-300 border-collapse">
              <thead>
                <tr class="border-b border-gray-600">
                  <th class="text-left w-2/5">Ship Type</th>
                  <th class="text-center w-1/5">Sent</th>
                  <th class="text-center w-1/5">Destroyed</th>
                  <th class="text-center w-1/5">Arrived</th>
                </tr>
              </thead>
              <tbody>
                ${["transportShip", "tradeShip", "warship"].map((ship) => {
                  const bs = this.getDisplayedBuildingStats();
                  const stats = bs[ship] as ShipStat;
                  return html`
                    <tr>
                      <td>${this.getBuildingName(ship)}</td>
                      <td class="text-center">${stats.sent ?? 0}</td>
                      <td class="text-center">${stats.destroyed ?? 0}</td>
                      <td class="text-center">${stats.arrived ?? 0}</td>
                    </tr>
                  `;
                })}
              </tbody>
            </table>
          </div>

          <div class="mt-4 w-full max-w-md">
            <div class="text-sm text-gray-400 font-semibold mb-1">
              ☢️ Nuke Statistics
            </div>
            <table class="w-full text-sm text-gray-300 border-collapse">
              <thead>
                <tr class="border-b border-gray-600">
                  <th class="text-left w-2/5">Weapon</th>
                  <th class="text-center w-1/5">Built</th>
                  <th class="text-center w-1/5">Destroyed</th>
                  <th class="text-center w-1/5">Hits</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  const bs = this.getDisplayedBuildingStats();
                  return Object.entries(bs)
                    .filter(([b]) =>
                      ["atom", "hydrogen", "mirv", "silo"].includes(b),
                    )
                    .map(([building, stats]) => {
                      const typedStats = stats as NukeStat;
                      return html`
                        <tr>
                          <td>${this.getBuildingName(building)}</td>
                          <td class="text-center">${typedStats.built ?? 0}</td>
                          <td class="text-center">
                            ${typedStats.destroyed ?? 0}
                          </td>
                          <td class="text-center">${typedStats.hits ?? 0}</td>
                        </tr>
                      `;
                    });
                })()}
              </tbody>
            </table>
          </div>

          <hr class="w-2/3 border-gray-600 my-2" />

          <hr class="w-2/3 border-gray-600 my-2" />

          <div class="mt-4 w-full max-w-md">
            <div class="text-sm text-gray-400 font-semibold mb-1">
              🎮 Recent Games
            </div>
            <div class="flex flex-col gap-2">
              ${this.recentGames.map(
                (game) => html`
                  <div
                    class="bg-white/5 rounded border border-white/10 overflow-hidden transition-all duration-300"
                  >
                    <!-- header row -->
                    <div class="flex items-center justify-between px-4 py-2">
                      <div>
                        <div class="text-sm font-semibold text-white">
                          Game ID: ${game.gameId}
                        </div>
                        <div class="text-xs text-gray-400">
                          Mode:
                          ${game.gameMode === "ffa"
                            ? "Free-for-All"
                            : html`Team (${game.teamCount} teams)`}
                        </div>
                        ${game.gameMode === "team" && game.teamColor
                          ? html`
                              <div class="text-white text-xs font-semibold">
                                Player Team Color: ${game.teamColor}
                              </div>
                            `
                          : null}
                        <div
                          class="text-xs ${game.won
                            ? "text-green-400"
                            : "text-red-400"}"
                        >
                          ${game.won ? "Victory" : "Defeat"}
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button
                          class="text-sm text-gray-300 bg-gray-700 px-3 py-1 rounded"
                          @click=${() => this.viewGame(game.gameId)}
                        >
                          View
                        </button>
                        <button
                          class="text-sm text-gray-300 bg-gray-600 px-3 py-1 rounded"
                          @click=${() => this.toggleGameDetails(game.gameId)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                    <!-- collapsible details inside the same card -->
                    <div
                      class="px-4 pb-2 text-xs text-gray-300 transition-all duration-300"
                      style="max-height: ${this.expandedGameId === game.gameId
                        ? "200px"
                        : "0"};
                             ${this.expandedGameId === game.gameId
                        ? ""
                        : "padding-top:0;padding-bottom:0;"}"
                    >
                      <div>
                        <span class="font-semibold">Started:</span> ${new Date(
                          game.start,
                        ).toLocaleString()}
                      </div>
                      <div>
                        <span class="font-semibold">Mode:</span>
                        ${game.gameMode === "ffa"
                          ? "Free-for-All"
                          : `Team (${game.teamCount ?? "?"} teams)`}
                      </div>
                      <div>
                        <span class="font-semibold">Map:</span> ${game.map}
                      </div>
                      <div>
                        <span class="font-semibold">Difficulty:</span>
                        ${game.difficulty}
                      </div>
                      <div>
                        <span class="font-semibold">Type:</span> ${game.type}
                      </div>
                    </div>
                  </div>
                `,
              )}
            </div>
          </div>
        </div>
      </o-modal>
    `;
  }

  public open() {
    this.requestUpdate();
    this.modalEl?.open();
  }

  public close() {
    this.modalEl?.close();
  }

  onUserMe(userMeResponse: UserMeResponse) {
    const { user, player } = userMeResponse;
    const { id, avatar, username, discriminator } = user;

    this.discordName = username;
    this.playerAvatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.${avatar.startsWith("a_") ? "gif" : "png"}`
      : `https://cdn.discordapp.com/embed/avatars/${Number(discriminator) % 5}.png`;

    if (player.publicId) {
      this.publicId = player.publicId;
    }

    this.loadFromApi();

    this.requestUpdate();
  }

  onLoggedOut() {
    this.playerName = "";
    this.playerAvatarUrl = "";
  }

  private async loadFromApi(): Promise<void> {
    try {
      // const res = await fetch("https://api.openfront.io/player/l0nRGXvi", {
      //   method: "GET",
      //   headers: { Accept: "application/json" },
      // });
      // if (!res.ok) {
      //   console.error("API error:", res.status, res.statusText);
      //   return;
      // }
      // const data = await res.json();

      // ---- MOCK ----
      const data = {
        createdAt: "2025-06-11T09:33:37.022Z",
        games: [
          {
            gameId: "vZqVWm6m",
            start: "2025-07-21T01:37:36.396Z",
            mode: "Free For All",
            type: "Public",
            map: "Australia",
            difficulty: "Medium",
            clientId: "mNDaav7X",
          },
          {
            gameId: "GWPxcrnz",
            start: "2025-07-20T02:22:50.210Z",
            mode: "Free For All",
            type: "Public",
            map: "Baikal",
            difficulty: "Medium",
            clientId: "efutv1Ao",
          },
          {
            gameId: "Nvv1NsEg",
            start: "2025-07-20T02:16:53.317Z",
            mode: "Free For All",
            type: "Public",
            map: "Australia",
            difficulty: "Medium",
            clientId: "A9Y2KQKi",
          },
          {
            gameId: "c8YRuB3y",
            start: "2025-07-19T04:25:53.820Z",
            mode: "Free For All",
            type: "Public",
            map: "Black Sea",
            difficulty: "Medium",
            clientId: "uUqbusgr",
          },
          {
            gameId: "tZaKFiK4",
            start: "2025-07-19T04:07:35.796Z",
            mode: "Free For All",
            type: "Public",
            map: "World",
            difficulty: "Medium",
            clientId: "ZNGErxX5",
          },
        ],
        stats: {
          Private: {
            "Free For All": {
              Medium: {
                wins: "0",
                losses: "1",
                total: "1",
                stats: {
                  attacks: ["4626208", "4304566", "423634"],
                  betrayals: "2",
                  boats: {
                    trade: ["7", "6", "0", "0"],
                    trans: ["6", "0", "0", "0"],
                  },
                  bombs: {
                    abomb: ["0", "0", "0"],
                    hbomb: ["0", "0", "0"],
                    mirv: ["0", "0", "0"],
                    mirvw: ["0", "0", "0"],
                  },
                  gold: ["453046", "0", "0", "0"],
                  units: {
                    city: ["1", "0", "2", "3"],
                    defp: ["0", "0", "0", "0"],
                    port: ["2", "0", "1", "3"],
                    saml: ["0", "0", "0", "0"],
                    silo: ["0", "0", "0", "0"],
                    wshp: ["0", "0", "0", "0"],
                  },
                },
              },
            },
          },
          Public: {
            "Free For All": {
              Medium: {
                wins: "0",
                losses: "10",
                total: "10",
                stats: {
                  attacks: ["87006524", "88219287", "48408649"],
                  betrayals: "3",
                  boats: {
                    trade: ["82", "80", "0", "7"],
                    trans: ["303", "0", "0", "17"],
                  },
                  bombs: {
                    abomb: ["4", "3", "5"],
                    hbomb: ["7", "8", "0"],
                    mirv: ["0", "0", "0"],
                    mirvw: ["0", "0", "0"],
                  },
                  gold: ["5938721", "241056", "0", "0"],
                  units: {
                    city: ["27", "31", "27", "52"],
                    defp: ["35", "42", "38", "72"],
                    port: ["21", "17", "36", "54"],
                    saml: ["3", "4", "1", "3"],
                    silo: ["9", "4", "3", "11"],
                    wshp: ["26", "22", "0", "19"],
                  },
                },
              },
            },
          },
        },
      };
      // ----------------------------------------------------------------------

      if (data?.stats) {
        this.applyBackendStats(data.stats);
      }

      if (Array.isArray(data?.games)) {
        this.recentGames = data.games.map((g: any) => ({
          gameId: g.gameId,
          start: g.start,
          map: g.map,
          difficulty: g.difficulty,
          type: g.type,
          won: false,
          gameMode:
            g.mode && String(g.mode).toLowerCase().includes("team")
              ? "team"
              : "ffa",
        }));
      }

      this.requestUpdate();
    } catch (err) {
      console.error("Failed to load player data from API:", err);
    }
  }
}

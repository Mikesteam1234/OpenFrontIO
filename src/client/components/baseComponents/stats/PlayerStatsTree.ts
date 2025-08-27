import "./PlayerStatsGrid";
import "./PlayerStatsTable";
import { Difficulty, GameMode, GameType } from "../../../../core/game/Game";
import { LitElement, html } from "lit";
import { PlayerStatsLeaf, PlayerStatsTree } from "../../../../core/ApiSchemas";
import { customElement, property, state } from "lit/decorators.js";
import { renderNumber, translateText } from "../../../Utils";
import { PlayerStats } from "../../../../core/StatsSchemas";

@customElement("player-stats-tree-view")
export class PlayerStatsTreeView extends LitElement {
  @property({ type: Object }) statsTree?: PlayerStatsTree;
  @state() visibility: GameType = GameType.Public;
  @state() selectedMode: GameMode = GameMode.FFA;
  @state() selectedDifficulty: Difficulty = Difficulty.Medium;

  createRenderRoot() {
    return this;
  }

  private getSelectedLeaf(): PlayerStatsLeaf | null {
    const typeNode = this.statsTree?.[this.visibility];
    if (!typeNode) return null;
    const modeNode = typeNode[this.selectedMode];
    if (!modeNode) return null;
    const diffNode = modeNode[this.selectedDifficulty];
    if (!diffNode) return null;
    return diffNode;
  }

  private getDisplayedStats(): PlayerStats | null {
    const leaf = this.getSelectedLeaf();
    if (!leaf || !leaf.stats) return null;
    return leaf.stats;
  }

  private setGameType(t: GameType) {
    if (this.visibility !== t) {
      this.visibility = t;
      this.requestUpdate();
    }
  }

  private setMode(m: GameMode) {
    if (this.selectedMode !== m) {
      this.selectedMode = m;
      this.requestUpdate();
    }
  }

  private setDifficulty(d: Difficulty) {
    if (this.selectedDifficulty !== d) {
      this.selectedDifficulty = d;
      this.requestUpdate();
    }
  }

  render() {
    const leaf = this.getSelectedLeaf();
    if (leaf === null) return html``;
    const wlr =
      leaf.losses === 0n ? leaf.wins : Number(leaf.wins) / Number(leaf.losses);

    return html`
      <!-- Visibility toggle under names -->
      <div class="flex gap-2 mt-2">
        <button
          class="text-xs px-2 py-0.5 rounded border ${this.visibility ===
          GameType.Public
            ? "border-white/60 text-white"
            : "border-white/20 text-gray-300"}"
          @click=${() => this.setGameType(GameType.Public)}
        >
          ${translateText("player_modal.public")}
        </button>
        <button
          class="text-xs px-2 py-0.5 rounded border ${this.visibility ===
          GameType.Private
            ? "border-white/60 text-white"
            : "border-white/20 text-gray-300"}"
          @click=${() => this.setGameType(GameType.Private)}
        >
          ${translateText("player_modal.private")}
        </button>
      </div>
      <!-- Mode selector -->
      <div class="flex gap-2 mt-2">
        ${([GameMode.FFA, GameMode.Team] as const).map(
          (m) => html`
            <button
              class="text-xs px-2 py-0.5 rounded border ${this.selectedMode ===
              m
                ? "border-white/60 text-white"
                : "border-white/20 text-gray-300"}"
              @click=${() => this.setMode(m)}
              title=${translateText("player_modal.mode")}
            >
              ${m === GameMode.FFA
                ? translateText("player_modal.mode_ffa")
                : translateText("player_modal.mode_team")}
            </button>
          `,
        )}
      </div>
      <!-- Difficulty selector -->
      <div class="flex gap-2 mt-2">
        ${(
          [
            Difficulty.Easy,
            Difficulty.Medium,
            Difficulty.Hard,
            Difficulty.Impossible,
          ] as const
        ).map(
          (d) => html`
            <button
              class="text-xs px-2 py-0.5 rounded border ${this
                .selectedDifficulty === d
                ? "border-white/60 text-white"
                : "border-white/20 text-gray-300"}"
              @click=${() => this.setDifficulty(d)}
              title=${translateText("player_modal.difficulty")}
            >
              ${d}
            </button>
          `,
        )}
      </div>
      <hr class="w-2/3 border-gray-600 my-2" />
      <player-stats-grid
        .titles=${[
          translateText("player_modal.stats_wins"),
          translateText("player_modal.stats_losses"),
          translateText("player_modal.stats_wlr"),
          translateText("player_modal.stats_games_played"),
          translateText("player_modal.stats_play_time"),
          translateText("player_modal.stats_last_active"),
        ]}
        .values=${[
          renderNumber(leaf.wins),
          renderNumber(leaf.losses),
          renderNumber(wlr),
          renderNumber(leaf.total),
          translateText("player_modal.not_applicable"),
          translateText("player_modal.not_applicable"),
        ]}
      ></player-stats-grid>

      <hr class="w-2/3 border-gray-600 my-2" />

      <player-stats-table
        .stats=${this.getDisplayedStats()}
      ></player-stats-table>
    `;
  }
}

import "./PlayerStatsGrid";
import "./PlayerStatsTable";
import { Difficulty, GameMode, GameType } from "../../../../core/game/Game";
import { LitElement, html } from "lit";
import { PlayerStatsLeaf, PlayerStatsTree } from "../../../../core/ApiSchemas";
import { customElement, state } from "lit/decorators.js";
import { PlayerStats } from "../../../../core/StatsSchemas";
import { translateText } from "../../../Utils";

@customElement("player-stats-tree-view")
export class PlayerStatsTreeView extends LitElement {
  @state() statsTree?: PlayerStatsTree;
  @state() visibility: GameType = GameType.Public;
  @state() selectedMode: GameMode = GameMode.FFA;
  @state() selectedDifficulty: Difficulty = Difficulty.Medium;

  createRenderRoot() {
    return this;
  }

  set props(v: {
    statsTree?: PlayerStatsTree;
    visibility: GameType;
    selectedMode: GameMode;
    selectedDifficulty: Difficulty;
    playTimeText?: string;
    lastActive?: string;
  }) {
    this.statsTree = v.statsTree;
    this.visibility = v.visibility;
    this.selectedMode = v.selectedMode;
    this.selectedDifficulty = v.selectedDifficulty;
    this.requestUpdate();
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

  render() {
    const leaf = this.getSelectedLeaf();
    if (leaf === null) return html``;
    const wlr = leaf.losses === 0n ? leaf.wins : Number(leaf.wins) / Number(leaf.losses);

    return html`
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
          wins,
          losses,
          wlr,
          gamesPlayed,
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

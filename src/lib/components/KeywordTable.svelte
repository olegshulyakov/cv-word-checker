<script lang="ts">
	import type { KeywordResult } from '$lib/engine/analyzer';
	import { i18n } from '$lib/i18n.svelte';

	let {
		title,
		group,
		emptyStateMsg
	}: {
		title: string;
		group: { present: KeywordResult[]; missing: KeywordResult[] };
		emptyStateMsg: string;
	} = $props();
</script>

<div class="keywords-section">
	<h3>{title}</h3>
	<div class="table-container">
		<table class="keywordtable">
			<thead>
				<tr>
					<th>{i18n.t('results.tableKeyword')}</th>
					<th class="text-center">{i18n.t('results.tableFoundInCv')}</th>
					<th class="text-center">{i18n.t('results.tableFoundInPd')}</th>
				</tr>
			</thead>
			<tbody>
				{#each group.present as kw (kw.term)}
					<tr>
						<td>
							<span class="status-icon present" aria-hidden="true">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg
								>
							</span>
							<strong>{i18n.keywordLabel(kw.term)}</strong>
						</td>
						<td class="text-center count-cell">{kw.cvCount || 0}</td>
						<td class="text-center count-cell">{kw.count}</td>
					</tr>
				{/each}
				{#each group.missing as kw (kw.term)}
					<tr class="missing-row">
						<td>
							<span class="status-icon missing" aria-hidden="true">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
									></line></svg
								>
							</span>
							<strong>{i18n.keywordLabel(kw.term)}</strong>
						</td>
						<td class="text-center count-cell warning-text">0</td>
						<td class="text-center count-cell">{kw.count}</td>
					</tr>
				{/each}
				{#if group.present.length === 0 && group.missing.length === 0}
					<tr>
						<td colspan="3" class="empty-state text-center">
							{emptyStateMsg}
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	h3 {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.table-container {
		width: 100%;
		overflow-x: auto;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		background: var(--bg-color);
	}

	.keywordtable {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 0.9375rem;
	}

	.keywordtable th,
	.keywordtable td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	.keywordtable th {
		background-color: var(--table-header-bg);
		font-weight: 600;
		color: var(--text-color);
	}

	.keywordtable tr:last-child td {
		border-bottom: none;
	}

	.keywordtable tbody tr:hover {
		background-color: var(--surface-hover);
		opacity: 0.8;
	}

	.missing-row {
		background-color: var(--table-row-missing);
	}

	.text-center {
		text-align: center;
	}

	.count-cell {
		font-variant-numeric: tabular-nums;
		font-weight: 500;
	}

	.warning-text {
		color: var(--accent-color);
	}

	.status-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-right: 0.5rem;
		vertical-align: middle;
	}

	.status-icon.present {
		color: var(--success-color);
	}

	.status-icon.missing {
		color: var(--accent-color);
	}

	.empty-state {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-style: italic;
		padding: 1.5rem;
	}
</style>

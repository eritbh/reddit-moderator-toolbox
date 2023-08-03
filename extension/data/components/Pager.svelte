<script context="module" lang="ts">
	export enum ControlPosition {
		Top = 'top',
		Bottom = 'bottom',
	}
</script>

<script lang="ts">
	import PagerButton from "./PagerButton.svelte";

	export let pageCount: number;
	export let controlPosition = ControlPosition.Bottom;
	export let contentFunction: ((pageIndex: number) => string) | null = null;

	let pageIndex = 0;
</script>

<div class="tb-pager">
	{#if controlPosition === ControlPosition.Top}
		<div class="tb-pager-controls">
			{#each {length: pageCount} as _, i}
				<PagerButton
					label={''+(i+1)}
					active={pageIndex === i}
					on:click={() => pageIndex = i}
				/>
			{/each}
		</div>
	{/if}

	<div class="tb-pager-content">
		<slot {pageIndex}>
			{#if contentFunction}
				{@html contentFunction(pageIndex)}
			{/if}
		</slot>
	</div>

	{#if controlPosition === ControlPosition.Bottom}
		<div class="tb-pager-controls">
			{#each {length: pageCount} as _, i}
				<PagerButton
					label={''+(i+1)}
					active={pageIndex === i}
					on:click={() => pageIndex = i}
				/>
			{/each}
		</div>
	{/if}
</div>

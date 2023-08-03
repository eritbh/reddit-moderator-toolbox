<script lang="ts" generics="Item">
	import Pager from "./Pager.svelte";

	type ContentFunction = (item: Item, index: number) => string;

	export let items: Item[] = [];
	export let itemsPerPage: number;
	export let wrapper = 'div';
	export let contentFunction: ContentFunction | null = null;
</script>

<Pager
	pageCount={Math.ceil(items.length / itemsPerPage)}
	let:pageIndex
>
	<svelte:element this={wrapper}>
		{#each items.slice(
			pageIndex * itemsPerPage,
			(1 + pageIndex) * itemsPerPage
		) as item, indexInPage}
			{@const i = (pageIndex * itemsPerPage) + indexInPage}
			<slot {item} {i}>
				{#if contentFunction}
					{@html contentFunction(item, i)}
				{/if}
			</slot>
		{/each}
	</svelte:element>
</Pager>

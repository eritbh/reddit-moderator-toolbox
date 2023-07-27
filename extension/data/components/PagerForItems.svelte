<script>
    import Pager from "./Pager.svelte";

	export let items = [];
	export let itemsPerPage;
	export let wrapper = 'div';
	export let contentFunction
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
				{@html contentFunction(item, i)}
			</slot>
		{/each}
	</svelte:element>
</Pager>

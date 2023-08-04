<script lang="ts" generics="Item">
	import Pager from './Pager.svelte';

	export let items: Item[] = [];
	export let itemsPerPage: number;
</script>

<Pager
	pageCount={Math.ceil(items.length / itemsPerPage)}
	let:pageIndex
>
	<slot pageItems={items.slice(
		pageIndex * itemsPerPage,
		(1 + pageIndex) * itemsPerPage
	)} />
</Pager>

<script>
    import PagerForItems from "./PagerForItems.svelte";
</script>

<div class="what">
	<PagerForItems
		items={["foo","bar","baz"]}
		itemsPerPage={2}
		let:item
		let:i
	>
		<p>{i}: {item}</p>
	</PagerForItems>
</div>

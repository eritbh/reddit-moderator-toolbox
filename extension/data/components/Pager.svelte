<script>
	import PagerButton from "./PagerButton.svelte";

	export let pageCount;

	let currentPageIndex = 0;
</script>

<div class="pager">
	<div class="pager-content">
		<slot pageIndex={currentPageIndex}>
			<p class="pager-no-content">Nothing to show</p>
		</slot>
	</div>
	<div class="pager-controls">
		{#each {length: pageCount} as _, i}
			<PagerButton
				label={i+1}
				active={currentPageIndex === i}
				on:click={() => currentPageIndex = i}
			/>
		{/each}
	</div>
</div>

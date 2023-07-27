<script>
	/** @type {string} */
	export let label;

	/** @type {boolean} */
	export let active;
</script>

<button
	class="tb-general-button tb-pager-control"
	class:tb-pager-control-active={active}
	on:click
>
	{label}
</button>

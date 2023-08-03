<script lang="ts">
	export let label: string;

	export let active: boolean;
</script>

<button
	class="tb-general-button tb-pager-control"
	class:tb-pager-control-active={active}
	on:click
>
	{label}
</button>

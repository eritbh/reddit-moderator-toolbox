<script lang="ts">
    import type {
		ComponentProps,
		ComponentType,
		SvelteComponent,
	} from 'svelte';

	export let tabs: Array<{
		title: string;
		tooltip?: string;
		component: ComponentType<SvelteComponent>;
		props?: ComponentProps<SvelteComponent>;
	}>;
	export let activeTab = 0;
</script>

<div class="tb-window-tab-panel">
	<div class="tb-window-tabs">
		{#each tabs as tab, i}
			<a
				title={tab.tooltip}
				class:active={activeTab === i}
				on:click={() => activeTab = i}
			>
				{tab.title}
			</a>
		{/each}
	</div>
	{#each tabs as tab, i}
		{#if i === activeTab}
			<div class="tb-window-tab">
				<svelte:component
					this={tab.component}
					{...tab.props}
				/>
			</div>
		{/if}
	{/each}
</div>

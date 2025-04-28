<script>
  import { onMount } from 'svelte';
  
  let loaded = false;
  
  onMount(async () => {
    try {
      // Dynamic import of the GridBackground component - client side only
      const module = await import('./GridBackground.svelte');
      
      // Handle both default and named exports
      const GridBackground = module.default || module.GridBackground;
      
      if (!document || !document.body) {
        console.error('Document or body not available');
        return;
      }
      
      // Create and mount the component
      const instance = new GridBackground({
        target: document.body
      });
      
      // Make shockwave function available globally
      if (typeof window !== 'undefined') {
        window.triggerGridBackgroundInstance = instance;
      }
      
      console.log('GridBackground mounted successfully');
      loaded = true;
    } catch (error) {
      console.error('Error loading GridBackground:', error);
    }
  });
</script>

{#if !loaded}
  <!-- Placeholder while loading -->
  <div class="grid-placeholder"></div>
{/if}

<style>
  .grid-placeholder {
    /* This placeholder won't be visible since we're using the bg in layout */
    display: none;
  }
</style> 
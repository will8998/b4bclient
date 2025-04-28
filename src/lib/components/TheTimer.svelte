<script>
  import { onMount, onDestroy } from 'svelte';

  let timeRemaining = 24 * 60 * 60;
  let intervalId;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  onMount(() => {
    intervalId = setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining -= 1;
      } else {
        clearInterval(intervalId);
      }
    }, 1000);
  });
  
  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });
</script>

{formatTime(timeRemaining)}

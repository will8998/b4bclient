<script context="module">
  // Export function at module level to ensure it's available for import
  export function triggerShockwave() {
    // Use safe window check for SSR
    if (typeof window !== 'undefined' && window.triggerGridShockwave) {
      window.triggerGridShockwave();
    }
  }
</script>

<script>
  import { onMount, onDestroy } from 'svelte';

  let container;
  let camera, scene, renderer, composer;
  let grid, gridMaterial;
  let clock;
  let mouseX = 0, mouseY = 0;
  let windowHalfX = 0;
  let windowHalfY = 0;
  let pulses = [];
  let lastPulseTime = 0;
  let isActive = true;
  let frameId;
  
  // Event emitter for button click
  let shockwaveActive = false;
  let shockwaveOrigin;
  let shockwaveTime = 0;
  let customShader;
  
  onMount(async () => {
    try {
      // Only run in browser
      if (typeof window === 'undefined') return;
      
      // Initialize THREE imports only in browser
      const THREE = await import('three');
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { ShaderPass } = await import('three/examples/jsm/postprocessing/ShaderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
      
      shockwaveOrigin = new THREE.Vector3(0, 0, 0);
      clock = new THREE.Clock();
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      
      // Custom shader for chromatic aberration and scanlines
      customShader = {
        uniforms: {
          "tDiffuse": { value: null },
          "time": { value: 0 },
          "amount": { value: 0.005 },
          "scanlineIntensity": { value: 0.05 },
          "scanlineCount": { value: 1000 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform float time;
          uniform float amount;
          uniform float scanlineIntensity;
          uniform float scanlineCount;
          varying vec2 vUv;

          void main() {
            // Chromatic aberration
            vec2 offset = amount * vec2(cos(time), sin(time));
            vec4 cr = texture2D(tDiffuse, vUv + offset);
            vec4 cg = texture2D(tDiffuse, vUv);
            vec4 cb = texture2D(tDiffuse, vUv - offset);
            vec4 color = vec4(cr.r, cg.g, cb.b, cg.a);
            
            // Scanlines
            float scanline = sin(vUv.y * scanlineCount * 3.14159);
            color.rgb -= scanline * scanlineIntensity;
            
            gl_FragColor = color;
          }
        `
      };

      // Pulse object constructor
      function Pulse(startPoint, direction) {
        this.line = new THREE.Line(
          new THREE.BufferGeometry(),
          new THREE.LineBasicMaterial({
            color: Math.random() > 0.5 ? 0xffffff : 0x00ff88,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
          })
        );
        
        this.startPoint = startPoint.clone();
        this.direction = direction.normalize();
        this.speed = 5 + Math.random() * 15;
        this.life = 0;
        this.maxLife = 1.0;
        
        // Create initial line points
        const points = [
          startPoint.clone(),
          startPoint.clone().add(direction.clone().multiplyScalar(0.1))
        ];
        
        this.line.geometry.setFromPoints(points);
        this.tailLength = 4 + Math.random() * 8; // Tail length factor
        
        scene.add(this.line);
      }

      Pulse.prototype.update = function(delta) {
        this.life += delta * this.speed * 0.5;
        
        if (this.life > this.maxLife) {
          scene.remove(this.line);
          return false;
        }
        
        // Calculate new head position
        const head = this.startPoint.clone().add(
          this.direction.clone().multiplyScalar(this.life * 20)
        );
        
        // Calculate tail position (trailing behind head)
        const tailFactor = Math.max(0, this.life - (delta * this.tailLength));
        const tail = this.startPoint.clone().add(
          this.direction.clone().multiplyScalar(tailFactor * 20)
        );
        
        // Update line geometry
        const points = [tail, head];
        this.line.geometry.dispose();
        this.line.geometry.setFromPoints(points);
        
        // Fade out as it moves
        this.line.material.opacity = 1 - (this.life / this.maxLife);
        
        return true;
      };

      // Create and initialize the 3D scene
      function init() {
        if (!container) return;
        
        // Create and setup the renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x1A002E, 1);
        container.appendChild(renderer.domElement);

        // Create scene and camera
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 15, 20);
        camera.lookAt(0, 0, 0);

        // Setup grid
        const gridSize = 120;
        const gridDivisions = 120;
        
        gridMaterial = new THREE.LineBasicMaterial({
          color: 0x00FFFF,
          opacity: 0.15,
          transparent: true,
          blending: THREE.AdditiveBlending
        });
        
        grid = new THREE.GridHelper(gridSize, gridDivisions, 0x00FFFF, 0x00FFFF);
        grid.material = gridMaterial; 
        grid.rotation.x = Math.PI / 2;
        grid.position.z = -10;
        scene.add(grid);

        // Add fog to create depth effect
        scene.fog = new THREE.Fog(0x1A002E, 20, 90);

        // Post-processing setup
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        
        // Bloom effect for glow
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          0.8,  // strength
          0.3,  // radius
          0.7   // threshold
        );
        composer.addPass(bloomPass);
        
        // Custom shader pass for chromatic aberration and scanlines
        const customPass = new ShaderPass(customShader);
        composer.addPass(customPass);

        // Event listeners for mouse movement and window resize
        document.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onWindowResize);
        
        // Initialize the animation clock
        clock.start();
      }

      // Handle window resize
      function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
      }

      // Track mouse position for parallax effect
      function onMouseMove(event) {
        mouseX = (event.clientX - windowHalfX) / 100;
        mouseY = (event.clientY - windowHalfY) / 100;
      }

      // Generate random pulse on the grid
      function createPulse() {
        // Random start position on the grid
        const gridExtent = 60;
        const height = -0.1; // Just slightly below grid plane
        
        // Generate random starting position on grid perimeter
        let startPoint;
        let direction;
        
        if (Math.random() > 0.5) {
          // Start from left or right edge
          startPoint = new THREE.Vector3(
            Math.random() > 0.5 ? -gridExtent : gridExtent,
            height,
            (Math.random() * 2 - 1) * gridExtent
          );
          direction = new THREE.Vector3(
            startPoint.x > 0 ? -1 : 1,
            0,
            (Math.random() * 2 - 1) * 0.5
          );
        } else {
          // Start from top or bottom edge
          startPoint = new THREE.Vector3(
            (Math.random() * 2 - 1) * gridExtent,
            height,
            Math.random() > 0.5 ? -gridExtent : gridExtent
          );
          direction = new THREE.Vector3(
            (Math.random() * 2 - 1) * 0.5,
            0,
            startPoint.z > 0 ? -1 : 1
          );
        }
        
        const pulse = new Pulse(startPoint, direction);
        pulses.push(pulse);
      }

      // Create a big shockwave effect for button clicks
      function triggerShockwaveEffect() {
        shockwaveActive = true;
        shockwaveTime = 0;
        shockwaveOrigin.set(0, 0, 0);
      }
      
      // Expose the function to the window for button click
      window.triggerGridShockwave = triggerShockwaveEffect;

      // Main animation loop
      function animate() {
        if (!isActive) return;
        
        frameId = requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();
        
        // Update custom shader uniforms
        composer.passes.forEach(pass => {
          if (pass.uniforms && pass.uniforms.time) {
            pass.uniforms.time.value = time;
          }
        });
        
        // Grid animation - pulsing brightness
        if (gridMaterial) {
          gridMaterial.opacity = 0.15 + Math.sin(time * 0.5) * 0.05;
          
          // Add glitch effect every few seconds
          if (Math.random() > 0.997) {
            grid.position.x += (Math.random() * 2 - 1) * 0.2;
            grid.position.y += (Math.random() * 2 - 1) * 0.2;
            
            // Reset position after small delay
            setTimeout(() => {
              if (grid) {
                grid.position.x = 0;
                grid.position.y = 0;
              }
            }, 200);
          }
        }
        
        // Create new pulses
        if (time - lastPulseTime > 0.5 + Math.random() * 2.5) {
          createPulse();
          lastPulseTime = time;
        }
        
        // Update existing pulses
        for (let i = pulses.length - 1; i >= 0; i--) {
          const isAlive = pulses[i].update(delta);
          if (!isAlive) {
            pulses.splice(i, 1);
          }
        }
        
        // Update shockwave effect if active
        if (shockwaveActive) {
          shockwaveTime += delta * 2;
          
          if (shockwaveTime > 3) {
            shockwaveActive = false;
          } else {
            const intensity = Math.sin(shockwaveTime * Math.PI / 3);
            const radius = shockwaveTime * 30;
            
            // Update grid distortion
            const vertices = grid.geometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
              const x = vertices[i];
              const y = vertices[i + 1];
              const z = vertices[i + 2];
              
              const distance = Math.sqrt(x * x + z * z);
              const within = Math.abs(distance - radius) < 5;
              
              if (within) {
                // Push vertices slightly upward in a wave
                vertices[i + 1] += intensity * 1.5 * (1 - Math.abs(distance - radius) / 5);
              }
            }
            
            grid.geometry.attributes.position.needsUpdate = true;
            
            // Reset grid after effect completes
            if (shockwaveTime > 2.9) {
              grid.geometry.dispose();
              scene.remove(grid);
              
              // Recreate the grid
              const gridSize = 120;
              const gridDivisions = 120;
              grid = new THREE.GridHelper(gridSize, gridDivisions, 0x00FFFF, 0x00FFFF);
              grid.material = gridMaterial;
              grid.rotation.x = Math.PI / 2;
              grid.position.z = -10;
              scene.add(grid);
            }
          }
        }
        
        // Subtle camera movement based on mouse position
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        
        // Render the scene with post-processing
        composer.render();
      }
      
      // Initialize and start animation
      console.log('Initializing 3D grid background');
      init();
      animate();
      
    } catch (error) {
      console.error("Error in GridBackground:", error);
    }
    
    return () => {
      isActive = false;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      
      // Clean up resources
      if (pulses) {
        pulses.forEach(pulse => {
          if (pulse.line) {
            pulse.line.geometry.dispose();
            pulse.line.material.dispose();
            scene && scene.remove(pulse.line);
          }
        });
      }
      
      if (grid) {
        grid.geometry.dispose();
        grid.material.dispose();
        scene && scene.remove(grid);
      }
      
      if (composer) {
        composer.passes.forEach(pass => {
          if (pass.dispose) pass.dispose();
        });
      }
      
      scene = null;
      camera = null;
      
      if (renderer) {
        renderer.dispose();
        renderer = null;
      }
      
      composer = null;
      
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousemove', onMouseMove);
      }
      
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onWindowResize);
        delete window.triggerGridShockwave;
      }
    };
  });
</script>

<div bind:this={container} class="grid-background"></div>

<style>
  .grid-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    background-color: #1A002E;
  }
</style> 
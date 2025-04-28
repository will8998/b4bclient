<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  let container;
  let camera, scene, renderer;
  let stars = [];
  let asteroids = [];
  let animationId;

  onMount(() => {
    initScene();
    animate();

    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(animationId);
      disposeScene();
    };
  });

  function initScene() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 800;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    createStars();

    createAsteroids();
  }

  function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true
    });

    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
    stars.push(starField);
  }

  function createAsteroids() {
    for (let i = 0; i < 20; i++) {
      createAsteroid();
    }
  }

  function createAsteroid() {
    const radius = 5 + Math.random() * 20;
    const geometry = new THREE.IcosahedronGeometry(radius, 1);
    
    const positionAttribute = geometry.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      const offset = radius * 0.2 * Math.random();
      vertex.normalize().multiplyScalar(radius + offset);
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2),
      roughness: 0.8,
      metalness: 0.2,
    });
    
    const asteroid = new THREE.Mesh(geometry, material);
    
    const distance = 300 + Math.random() * 500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    asteroid.position.x = distance * Math.sin(phi) * Math.cos(theta);
    asteroid.position.y = distance * Math.sin(phi) * Math.sin(theta);
    asteroid.position.z = distance * Math.cos(phi);
    
    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    asteroid.rotation.z = Math.random() * Math.PI;
    
    asteroid.userData = {
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      },
      orbitSpeed: (Math.random() - 0.5) * 0.005,
      orbitRadius: distance,
      orbitAngle: theta
    };
    
    scene.add(asteroid);
    asteroids.push(asteroid);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    
    const cameraRotationSpeed = 0.00005;
    camera.position.x = Math.sin(Date.now() * cameraRotationSpeed) * 800;
    camera.position.z = Math.cos(Date.now() * cameraRotationSpeed) * 800;
    camera.lookAt(0, 0, 0);
    
    asteroids.forEach(asteroid => {
      asteroid.rotation.x += asteroid.userData.rotationSpeed.x;
      asteroid.rotation.y += asteroid.userData.rotationSpeed.y;
      asteroid.rotation.z += asteroid.userData.rotationSpeed.z;
      
      asteroid.userData.orbitAngle += asteroid.userData.orbitSpeed;
      asteroid.position.x = Math.sin(asteroid.userData.orbitAngle) * asteroid.userData.orbitRadius;
      asteroid.position.z = Math.cos(asteroid.userData.orbitAngle) * asteroid.userData.orbitRadius;
    });
    
    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function disposeScene() {
    if (scene) {
      if (asteroids && asteroids.length) {
        asteroids.forEach(asteroid => {
          if (asteroid) {
            scene.remove(asteroid);
            if (asteroid.geometry) asteroid.geometry.dispose();
            if (asteroid.material) {
              if (Array.isArray(asteroid.material)) {
                asteroid.material.forEach(mat => {
                  if (mat) mat.dispose();
                });
              } else {
                asteroid.material.dispose();
              }
            }
          }
        });
      }
      
      if (stars && stars.length) {
        stars.forEach(star => {
          if (star) {
            scene.remove(star);
            if (star.geometry) star.geometry.dispose();
            if (star.material) {
              if (Array.isArray(star.material)) {
                star.material.forEach(mat => {
                  if (mat) mat.dispose();
                });
              } else {
                star.material.dispose();
              }
            }
          }
        });
      }
    }
    
    if (renderer) {
      renderer.dispose();
    }
  }

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    disposeScene();
  });
</script>

<div bind:this={container} class="asteroid-background"></div>

<style>
  .asteroid-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;
  }
</style>

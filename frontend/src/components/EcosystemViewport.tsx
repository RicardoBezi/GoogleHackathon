import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import type { Species } from '../types';
import WaterSurfaceSimple from '../../WaterSurface/WaterSurfaceSimple';
import Terrain from './Terrain';
import SpeciesMarkers from './SpeciesMarkers';

interface EcosystemViewportProps {
  species: Species[];
  season: string;
}

interface SceneProps {
  species: Species[];
  season: string;
}

function Scene({ species, season }: SceneProps) {
  const sunPosition: [number, number, number] = [7, 7, 1];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight intensity={2} position={sunPosition} />

      {/* Sky */}
      <Sky
        sunPosition={sunPosition}
        turbidity={2}
        rayleigh={0.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Ocean - realistic water with reflections */}
      <WaterSurfaceSimple
        width={120}
        length={120}
        position={[0, -3.5, 0]}
        waterColor={0x1E90FF}
        distortionScale={3.5}
        alpha={0.6}
      />

      {/* Terrain */}
      <Terrain position={[0, -3, 0]} species={species} season={season} />

      {/* Species markers as dots on land */}
      <SpeciesMarkers species={species} terrainSize={64} terrainPosition={[0, -3, 0]} />

      {/* Camera controls */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

export default function EcosystemViewport({ species, season }: EcosystemViewportProps) {
  return (
    <Canvas
      camera={{ position: [20, 15, 20], fov: 45 }}
      shadows
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <Scene species={species} season={season} />
      </Suspense>

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.8}
          luminanceSmoothing={0.9}
          intensity={0.3}
        />
      </EffectComposer>
    </Canvas>
  );
}

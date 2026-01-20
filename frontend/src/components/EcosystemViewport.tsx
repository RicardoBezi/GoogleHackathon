import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import type { Tile } from '../types';
import { BIOME_COLORS } from '../types';

interface TileMeshProps {
  tile: Tile;
  gridSize: number;
  isSelected: boolean;
  onClick: () => void;
}

function TileMesh({ tile, gridSize, isSelected, onClick }: TileMeshProps) {
  const color = BIOME_COLORS[tile.biome];
  const offset = gridSize / 2 - 0.5;
  const height = 0.1 + (tile.elevation / 100) * 0.8;

  return (
    <mesh
      position={[tile.x - offset, height / 2, tile.y - offset]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <boxGeometry args={[0.9, height, 0.9]} />
      <meshStandardMaterial
        color={isSelected ? '#ffffff' : color}
        transparent
        opacity={0.85}
      />
      <Edges color={isSelected ? '#00ffff' : '#ffffff'} threshold={15} lineWidth={1} />
    </mesh>
  );
}

interface TreeProps {
  position: [number, number, number];
}

function Tree({ position }: TreeProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.15, 0.4, 4]} />
        <meshStandardMaterial color="#1a4025" transparent opacity={0.9} />
        <Edges color="#ffffff" threshold={15} />
      </mesh>
    </group>
  );
}

interface MountainProps {
  position: [number, number, number];
}

function Mountain({ position }: MountainProps) {
  return (
    <mesh position={position}>
      <coneGeometry args={[0.3, 0.6, 4]} />
      <meshStandardMaterial color="#4a4a5a" transparent opacity={0.9} />
      <Edges color="#ffffff" threshold={15} />
    </mesh>
  );
}

interface EcosystemViewportProps {
  tiles: Tile[];
  gridSize: number;
  selectedTile: [number, number] | null;
  onTileSelect: (x: number, y: number) => void;
}

export default function EcosystemViewport({
  tiles,
  gridSize,
  selectedTile,
  onTileSelect,
}: EcosystemViewportProps) {
  return (
    <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
      <color attach="background" args={['#0a0a0a']} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, 10, -10]} intensity={0.3} />

      <group>
        {tiles.map((tile) => (
          <TileMesh
            key={`${tile.x}-${tile.y}`}
            tile={tile}
            gridSize={gridSize}
            isSelected={selectedTile?.[0] === tile.x && selectedTile?.[1] === tile.y}
            onClick={() => onTileSelect(tile.x, tile.y)}
          />
        ))}

        {/* Add trees to forest tiles */}
        {tiles
          .filter((t) => t.biome === 'forest')
          .map((tile) => {
            const offset = gridSize / 2 - 0.5;
            const baseHeight = 0.1 + (tile.elevation / 100) * 0.8;
            return (
              <Tree
                key={`tree-${tile.x}-${tile.y}`}
                position={[tile.x - offset, baseHeight, tile.y - offset]}
              />
            );
          })}

        {/* Add peaks to mountain tiles */}
        {tiles
          .filter((t) => t.biome === 'mountain')
          .map((tile) => {
            const offset = gridSize / 2 - 0.5;
            const baseHeight = 0.1 + (tile.elevation / 100) * 0.8;
            return (
              <Mountain
                key={`mountain-${tile.x}-${tile.y}`}
                position={[tile.x - offset, baseHeight + 0.3, tile.y - offset]}
              />
            );
          })}
      </group>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.9} intensity={0.3} />
      </EffectComposer>
    </Canvas>
  );
}

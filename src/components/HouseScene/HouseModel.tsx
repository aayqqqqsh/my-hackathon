/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface HouseModelProps {
  customGlbUrl?: string | null;
  onModelLoaded?: (isCustom: boolean) => void;
}

export function HouseModel({
  customGlbUrl,
  onModelLoaded,
}: HouseModelProps) {
  const [loadError, setLoadError] = useState(false);
  const [loadedScene, setLoadedScene] = useState<THREE.Group | null>(null);

  // Attempt to load GLTF if custom URL is provided or check default candidates
  const urlToTry = customGlbUrl || '/house.glb';

  useEffect(() => {
    let active = true;
    const loader = new GLTFLoader();

    loader.load(
      urlToTry,
      (gltf) => {
        if (!active) return;
        const scene = gltf.scene;

        // Auto-scale and center the loaded GLB model using its bounding box
        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Desired size across the scene so it fills the viewport nicely (14 units wide)
        const maxDimension = Math.max(size.x, size.z, size.y * 1.4);
        if (maxDimension > 0) {
          const targetDimension = 14.0;
          const scaleFactor = targetDimension / maxDimension;
          scene.scale.set(scaleFactor, scaleFactor, scaleFactor);

          // Re-compute bounding box with scale applied to sit bottom on y = 0
          box.setFromObject(scene);
          box.getCenter(center);
          scene.position.x = -center.x;
          scene.position.y = -box.min.y;
          scene.position.z = -center.z;
        }

        // Ensure all meshes cast and receive shadows and react dynamically to room pointlights
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat: any) => {
                  if (mat && 'roughness' in mat) mat.roughness = Math.max(mat.roughness ?? 0.65, 0.45);
                  if (mat && 'metalness' in mat) mat.metalness = Math.min(mat.metalness ?? 0.1, 0.2);
                });
              } else {
                const mat = mesh.material as any;
                if (mat && 'roughness' in mat) mat.roughness = Math.max(mat.roughness ?? 0.65, 0.45);
                if (mat && 'metalness' in mat) mat.metalness = Math.min(mat.metalness ?? 0.1, 0.2);
              }
            }
          }
        });

        setLoadedScene(scene);
        setLoadError(false);
        onModelLoaded?.(true);
      },
      undefined,
      () => {
        if (!active) return;
        setLoadError(true);
        setLoadedScene(null);
        onModelLoaded?.(false);
      }
    );

    return () => {
      active = false;
    };
  }, [urlToTry, onModelLoaded]);

  // If external GLB is loaded, render the scaled and centered model
  if (loadedScene && !loadError) {
    return <primitive object={loadedScene} />;
  }

  // Fallback: Architectural Fused Multi-Room House Structure (Scaled to 14x12 footprint)
  return (
    <group position={[0, 0, 0]}>
      {/* House Foundation Slab */}
      <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[14, 0.3, 12]} />
        <meshStandardMaterial color="#1a202c" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Main Floor Surface */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[13.6, 11.6]} />
        <meshStandardMaterial color="#1e2536" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* ========================================================================= */}
      {/* EXTERIOR PERIMETER WALLS                                                  */}
      {/* ========================================================================= */}
      {/* North Exterior Wall (with Garage Door Cutout at East) */}
      <mesh position={[-2.2, 1.25, -5.8]} castShadow receiveShadow>
        <boxGeometry args={[9.2, 2.5, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh position={[6.6, 1.25, -5.8]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 2.5, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh position={[4.5, 2.3, -5.8]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 0.4, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* South Exterior Wall with Front Entryway Cutout */}
      <mesh position={[-3.8, 1.25, 5.8]} castShadow receiveShadow>
        <boxGeometry args={[6.0, 2.5, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh position={[3.8, 1.25, 5.8]} castShadow receiveShadow>
        <boxGeometry args={[6.0, 2.5, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.3, 5.8]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.4, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* West Exterior Wall */}
      <mesh position={[-6.8, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 2.5, 11.6]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* East Exterior Wall */}
      <mesh position={[6.8, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 2.5, 11.6]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* ========================================================================= */}
      {/* INTERIOR DIVIDING WALLS (9 ZONES CLEAR BOUNDARIES)                        */}
      {/* ========================================================================= */}
      {/* West Wing Spine Wall (Separates Master Bed & Bed 2 from Living/Bath) */}
      <mesh position={[-2.4, 1.1, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 2.2, 10.8]} />
        <meshStandardMaterial color="#3b4252" roughness={0.7} />
      </mesh>

      {/* West Wing Horizontal Divider (Master Bed South vs Bed 2 North) */}
      <mesh position={[-4.6, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.2, 0.2]} />
        <meshStandardMaterial color="#3b4252" roughness={0.7} />
      </mesh>

      {/* Living Room & Dining/Kitchen Divider */}
      <mesh position={[1.4, 1.1, 2.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 2.2, 6.8]} />
        <meshStandardMaterial color="#3b4252" roughness={0.7} />
      </mesh>

      {/* Bathroom 1 & Bathroom 2 Hallway Wall (South boundary of both bathrooms) */}
      <mesh position={[-0.4, 1.1, -1.6]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.2, 0.2]} />
        <meshStandardMaterial color="#3b4252" roughness={0.7} />
      </mesh>

      {/* Bathroom 1 vs Bathroom 2 Center Partition */}
      <mesh position={[-0.4, 1.1, -3.7]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 2.2, 4.0]} />
        <meshStandardMaterial color="#3b4252" roughness={0.7} />
      </mesh>

      {/* Bathroom 2 vs Bedroom 3 East Boundary Partition */}
      <mesh position={[1.6, 1.1, -3.7]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 2.2, 4.0]} />
        <meshStandardMaterial color="#3b4252" roughness={0.7} />
      </mesh>

      {/* Bedroom 3 vs Garage Dividing Wall */}
      <mesh position={[4.0, 1.1, -2.9]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 2.2, 5.6]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>

      {/* Garage & Bedroom 3 South Boundary Wall (Separating from Dining/Kitchen) */}
      <mesh position={[4.2, 1.1, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 2.2, 0.2]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>

      {/* ========================================================================= */}
      {/* ROOM 1: LIVING ROOM (Center-South)                                       */}
      {/* ========================================================================= */}
      {/* Living Room Modern Sofa */}
      <mesh position={[-0.5, 0.35, 2.2]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.7, 1.1]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[-0.5, 0.7, 1.7]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.6, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {/* Coffee Table */}
      <mesh position={[-0.5, 0.22, 3.3]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.15, 0.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* TV Console Unit on Spine Wall */}
      <mesh position={[-2.2, 0.7, 2.2]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.8, 1.8]} />
        <meshStandardMaterial color="#020617" roughness={0.3} />
      </mesh>

      {/* ========================================================================= */}
      {/* ROOM 2: DINING ROOM (East-Mid-South)                                     */}
      {/* ========================================================================= */}
      {/* Dining Table */}
      <mesh position={[2.8, 0.55, 2.6]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.1, 1.2]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>
      <mesh position={[2.8, 0.25, 2.6]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
      {/* Dining Chairs */}
      <mesh position={[2.8, 0.35, 1.8]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.5, 0.3]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[2.8, 0.35, 3.4]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.5, 0.3]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* ========================================================================= */}
      {/* ROOM 3: KITCHEN (Far East-South)                                         */}
      {/* ========================================================================= */}
      {/* Kitchen Island Counter & Cabinet */}
      <mesh position={[5.6, 0.5, 2.6]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.0, 3.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      {/* Stainless Sink Basin */}
      <mesh position={[5.6, 0.95, 2.0]} castShadow>
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Kitchen Chimney Hood on Wall */}
      <mesh position={[6.5, 1.8, 3.2]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.5, 0.8]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>

      {/* ========================================================================= */}
      {/* ROOM 4: MASTER BEDROOM (West-South)                                      */}
      {/* ========================================================================= */}
      {/* Master Bed Mattress & Base */}
      <mesh position={[-4.6, 0.35, 2.8]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.6, 2.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Headboard */}
      <mesh position={[-4.6, 0.75, 4.2]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.9, 0.25]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {/* Bedside Nightstands */}
      <mesh position={[-3.0, 0.25, 4.0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-6.2, 0.25, 4.0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* ========================================================================= */}
      {/* ROOM 5: BEDROOM 2 (West-North)                                           */}
      {/* ========================================================================= */}
      {/* Single Bed */}
      <mesh position={[-4.6, 0.35, -2.8]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.6, 2.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Bed 2 Headboard */}
      <mesh position={[-4.6, 0.7, -4.0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {/* Study Desk & Laptop */}
      <mesh position={[-6.0, 0.45, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.8, 1.6]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* ========================================================================= */}
      {/* ROOM 6: MAIN BATHROOM / BATHROOM 1 (Center-North-West)                    */}
      {/* ========================================================================= */}
      {/* Bathtub */}
      <mesh position={[-1.4, 0.32, -4.5]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.6, 1.8]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Vanity Sink */}
      <mesh position={[-1.4, 0.45, -2.4]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.8, 0.6]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>
      {/* Toilet */}
      <mesh position={[-2.0, 0.3, -3.2]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>

      {/* ========================================================================= */}
      {/* ROOM 7: GUEST BATHROOM / BATHROOM 2 (Center-North-East)                  */}
      {/* ========================================================================= */}
      {/* Glass Shower Enclosure Base */}
      <mesh position={[0.6, 0.1, -4.7]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.2, 1.4]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.3} transparent opacity={0.85} />
      </mesh>
      {/* Shower Glass Wall */}
      <mesh position={[0.6, 1.0, -4.0]} castShadow>
        <boxGeometry args={[1.4, 1.6, 0.05]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      {/* Vanity Sink */}
      <mesh position={[0.6, 0.45, -2.4]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.8, 0.6]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>
      {/* Toilet */}
      <mesh position={[1.2, 0.3, -3.3]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>

      {/* ========================================================================= */}
      {/* ROOM 8: BEDROOM 3 / STUDIO (East-North-Mid)                              */}
      {/* ========================================================================= */}
      {/* Studio Executive Workstation Desk */}
      <mesh position={[2.8, 0.45, -2.8]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.8, 1.2]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* Computer Dual Monitors */}
      <mesh position={[2.8, 0.95, -3.2]} castShadow>
        <boxGeometry args={[1.4, 0.4, 0.08]} />
        <meshStandardMaterial color="#020617" roughness={0.2} />
      </mesh>
      {/* Studio Bookcase / Shelving Unit */}
      <mesh position={[1.9, 0.9, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 1.8, 1.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* ========================================================================= */}
      {/* ROOM 9: DEDICATED ENCLOSED GARAGE BAY (Far East-North)                   */}
      {/* ========================================================================= */}
      {/* Garage Floor Surface with Parking Oil-Resistant Sheen */}
      <mesh position={[5.4, 0.03, -2.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.6, 5.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Parked Vehicle / Car Model */}
      {/* Car Main Body Chassis */}
      <mesh position={[5.4, 0.45, -2.8]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.65, 3.8]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Car Cabin & Windshield */}
      <mesh position={[5.4, 0.85, -2.6]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.5, 2.0]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Car Wheels (4 Wheels) */}
      <mesh position={[4.45, 0.25, -1.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>
      <mesh position={[6.35, 0.25, -1.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>
      <mesh position={[4.45, 0.25, -4.0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>
      <mesh position={[6.35, 0.25, -4.0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>
      {/* Car Headlights */}
      <mesh position={[5.0, 0.45, -4.7]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[5.8, 0.45, -4.7]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.6} />
      </mesh>

      {/* Garage Mechanic Workbench & Tool Rack */}
      <mesh position={[6.5, 0.5, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.9, 1.8]} />
        <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Segmented Garage Roll-up Door Threshold */}
      <mesh position={[5.4, 0.06, -5.7]} receiveShadow castShadow>
        <boxGeometry args={[2.6, 0.12, 0.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} />
      </mesh>

      {/* ========================================================================= */}
      {/* ROOM 10: FRONT PORCH & ENTRANCE (South Center)                            */}
      {/* ========================================================================= */}
      {/* Front Entry Porch Step */}
      <mesh position={[0, 0.08, 6.4]} receiveShadow castShadow>
        <boxGeometry args={[2.8, 0.16, 1.0]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {/* Porch Columns */}
      <mesh position={[-1.2, 1.2, 6.6]} castShadow>
        <boxGeometry args={[0.2, 2.4, 0.2]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      <mesh position={[1.2, 1.2, 6.6]} castShadow>
        <boxGeometry args={[0.2, 2.4, 0.2]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
    </group>
  );
}

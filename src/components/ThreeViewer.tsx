"use client";

import { useRef, useMemo, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface Vertex {
  x: number;
  y: number;
  z: number;
}

interface Face {
  a: number;
  b: number;
  c: number;
}

interface SkeletonJoint {
  name: string;
  x: number;
  y: number;
  z: number;
}

interface SkeletonBone {
  from: string;
  to: string;
}

interface SkeletonData {
  joints: SkeletonJoint[];
  bones: SkeletonBone[];
}

interface ThreeViewerProps {
  vertices: Vertex[];
  faces: Face[];
  normals: Vertex[];
  skeleton: SkeletonData | null;
  showSkeleton: boolean;
}

function MeshObject({
  vertices,
  faces,
  normals,
}: {
  vertices: Vertex[];
  faces: Face[];
  normals: Vertex[];
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    const positions = new Float32Array(faces.length * 3 * 3);
    const normalArray = new Float32Array(faces.length * 3 * 3);

    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      const vA = vertices[face.a];
      const vB = vertices[face.b];
      const vC = vertices[face.c];

      const nA = normals[face.a] || { x: 0, y: 0, z: 1 };
      const nB = normals[face.b] || { x: 0, y: 0, z: 1 };
      const nC = normals[face.c] || { x: 0, y: 0, z: 1 };

      if (vA && vB && vC) {
        positions[i * 9 + 0] = vA.x;
        positions[i * 9 + 1] = vA.y;
        positions[i * 9 + 2] = vA.z;
        positions[i * 9 + 3] = vB.x;
        positions[i * 9 + 4] = vB.y;
        positions[i * 9 + 5] = vB.z;
        positions[i * 9 + 6] = vC.x;
        positions[i * 9 + 7] = vC.y;
        positions[i * 9 + 8] = vC.z;

        normalArray[i * 9 + 0] = nA.x;
        normalArray[i * 9 + 1] = nA.y;
        normalArray[i * 9 + 2] = nA.z;
        normalArray[i * 9 + 3] = nB.x;
        normalArray[i * 9 + 4] = nB.y;
        normalArray[i * 9 + 5] = nB.z;
        normalArray[i * 9 + 6] = nC.x;
        normalArray[i * 9 + 7] = nC.y;
        normalArray[i * 9 + 8] = nC.z;
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(normalArray, 3));

    return geo;
  }, [vertices, faces, normals]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#8b5cf6"
        metalness={0.3}
        roughness={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function SkeletonView({
  skeleton,
  visible,
}: {
  skeleton: SkeletonData;
  visible: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  if (!visible) return null;

  const jointMap = new Map(skeleton.joints.map((j) => [j.name, j]));

  return (
    <group ref={groupRef}>
      {/* Joints as spheres */}
      {skeleton.joints.map((joint) => (
        <mesh key={joint.name} position={[joint.x, joint.y, joint.z]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Bones as lines */}
      {skeleton.bones.map((bone, idx) => {
        const from = jointMap.get(bone.from);
        const to = jointMap.get(bone.to);
        if (!from || !to) return null;

        const points = [
          new THREE.Vector3(from.x, from.y, from.z),
          new THREE.Vector3(to.x, to.y, to.z),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <lineSegments key={idx} geometry={lineGeo}>
            <lineBasicMaterial color="#f97316" linewidth={2} />
          </lineSegments>
        );
      })}
    </group>
  );
}

export default function ThreeViewer({
  vertices,
  faces,
  normals,
  skeleton,
  showSkeleton,
}: ThreeViewerProps) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="w-full h-[500px] bg-gray-900/50 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">Loading 3D viewer...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] bg-gray-900/80 rounded-2xl overflow-hidden border border-gray-700/50">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 2.5]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
        />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} />
        <pointLight position={[0, 2, 3]} intensity={0.5} color="#8b5cf6" />

        <MeshObject vertices={vertices} faces={faces} normals={normals} />

        {skeleton && (
          <SkeletonView skeleton={skeleton} visible={showSkeleton} />
        )}

        {/* Grid helper */}
        <gridHelper
          args={[4, 20, "#333333", "#222222"]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, -0.1]}
        />
      </Canvas>
    </div>
  );
}

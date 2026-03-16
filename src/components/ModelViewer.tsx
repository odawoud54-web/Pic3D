"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  objUrl: string;
  textureUrl: string;
}

function DepthMesh({
  objUrl,
  textureUrl,
}: {
  objUrl: string;
  textureUrl: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Parse OBJ and create geometry
  useEffect(() => {
    fetch(objUrl)
      .then((res) => res.text())
      .then((text) => {
        const geo = parseOBJ(text);
        setGeometry(geo);
      });
  }, [objUrl]);

  // Load texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(textureUrl, (tex) => {
      tex.flipY = false;
      setTexture(tex);
    });
  }, [textureUrl]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  if (!geometry || !texture) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function parseOBJ(text: string): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];

  const vertexPositions: number[][] = [];
  const vertexUVs: number[][] = [];
  const vertexNormals: number[][] = [];

  const lines = text.split("\n");

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const type = parts[0];

    if (type === "v") {
      vertexPositions.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
      ]);
    } else if (type === "vt") {
      vertexUVs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
    } else if (type === "vn") {
      vertexNormals.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
      ]);
    } else if (type === "f") {
      // Triangulate faces (support quads)
      const faceVerts = parts.slice(1).map((v) => {
        const indices = v.split("/");
        return {
          pos: parseInt(indices[0]) - 1,
          uv: indices[1] ? parseInt(indices[1]) - 1 : -1,
          norm: indices[2] ? parseInt(indices[2]) - 1 : -1,
        };
      });

      for (let i = 1; i < faceVerts.length - 1; i++) {
        for (const idx of [0, i, i + 1]) {
          const vert = faceVerts[idx];
          if (vertexPositions[vert.pos]) {
            positions.push(...vertexPositions[vert.pos]);
          }
          if (vert.uv >= 0 && vertexUVs[vert.uv]) {
            uvs.push(...vertexUVs[vert.uv]);
          }
          if (vert.norm >= 0 && vertexNormals[vert.norm]) {
            normals.push(...vertexNormals[vert.norm]);
          }
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  if (uvs.length > 0) {
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  }

  if (normals.length > 0) {
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(normals, 3)
    );
  } else {
    geometry.computeVertexNormals();
  }

  return geometry;
}

export function ModelViewer({ objUrl, textureUrl }: ModelViewerProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 50 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <DepthMesh objUrl={objUrl} textureUrl={textureUrl} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={false}
      />
    </Canvas>
  );
}

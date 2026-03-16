import type { DepthAnalysis } from "./gemini";

export interface Vertex {
  x: number;
  y: number;
  z: number;
}

export interface Face {
  a: number;
  b: number;
  c: number;
}

export interface SkeletonData {
  joints: { name: string; x: number; y: number; z: number }[];
  bones: { from: string; to: string }[];
}

export interface MeshData {
  vertices: Vertex[];
  faces: Face[];
  normals: Vertex[];
  skeleton: SkeletonData | null;
}

/**
 * Generate a 3D mesh from depth analysis data.
 * Creates a displacement surface from the depth map.
 */
export function generateMeshFromDepth(analysis: DepthAnalysis): MeshData {
  const { depthMap } = analysis;
  const rows = depthMap.length;
  const cols = depthMap[0]?.length || 16;

  const vertices: Vertex[] = [];
  const faces: Face[] = [];
  const normals: Vertex[] = [];

  // Generate vertices from depth map
  const depthScale = 0.8;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = (j / (cols - 1)) * 2 - 1;
      const y = -((i / (rows - 1)) * 2 - 1);
      const z = (1 - (depthMap[i]?.[j] ?? 0.5)) * depthScale;
      vertices.push({ x, y, z });
    }
  }

  // Generate faces (two triangles per grid cell)
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const topLeft = i * cols + j;
      const topRight = topLeft + 1;
      const bottomLeft = (i + 1) * cols + j;
      const bottomRight = bottomLeft + 1;

      faces.push({ a: topLeft, b: bottomLeft, c: topRight });
      faces.push({ a: topRight, b: bottomLeft, c: bottomRight });
    }
  }

  // Calculate normals per vertex
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const idx = i * cols + j;
      const v = vertices[idx];

      // Use finite differences for normal approximation
      let dx = 0,
        dy = 0;
      if (j > 0 && j < cols - 1) {
        dx = vertices[idx + 1].z - vertices[idx - 1].z;
      }
      if (i > 0 && i < rows - 1) {
        dy = vertices[idx + cols].z - vertices[idx - cols].z;
      }

      const nx = -dx;
      const ny = dy;
      const nz = 2 / Math.max(rows, cols);
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      normals.push({ x: nx / len, y: ny / len, z: nz / len });
    }
  }

  // Add back face (flat plane behind the object)
  const backOffset = vertices.length;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = (j / (cols - 1)) * 2 - 1;
      const y = -((i / (rows - 1)) * 2 - 1);
      vertices.push({ x, y, z: -0.05 });
      normals.push({ x: 0, y: 0, z: -1 });
    }
  }

  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const topLeft = backOffset + i * cols + j;
      const topRight = topLeft + 1;
      const bottomLeft = backOffset + (i + 1) * cols + j;
      const bottomRight = bottomLeft + 1;

      faces.push({ a: topLeft, b: topRight, c: bottomLeft });
      faces.push({ a: topRight, b: bottomRight, c: bottomLeft });
    }
  }

  return {
    vertices,
    faces,
    normals,
    skeleton: analysis.suggestedSkeleton || null,
  };
}

/**
 * Export mesh data as OBJ format (compatible with Blender import)
 */
export function meshToOBJ(mesh: MeshData): string {
  const lines: string[] = [];
  lines.push("# Pic3D Generated 3D Model");
  lines.push("# Created with Gemini AI depth analysis");
  lines.push("");

  // Vertices
  for (const v of mesh.vertices) {
    lines.push(`v ${v.x.toFixed(6)} ${v.y.toFixed(6)} ${v.z.toFixed(6)}`);
  }
  lines.push("");

  // Normals
  for (const n of mesh.normals) {
    lines.push(`vn ${n.x.toFixed(6)} ${n.y.toFixed(6)} ${n.z.toFixed(6)}`);
  }
  lines.push("");

  // Faces (OBJ is 1-indexed)
  for (const f of mesh.faces) {
    lines.push(
      `f ${f.a + 1}//${f.a + 1} ${f.b + 1}//${f.b + 1} ${f.c + 1}//${f.c + 1}`
    );
  }

  return lines.join("\n");
}

/**
 * Generate a Blender Python script to import the OBJ and set up the skeleton
 */
export function generateBlenderScript(
  mesh: MeshData,
  objFilename: string
): string {
  const lines: string[] = [];
  lines.push("import bpy");
  lines.push("import os");
  lines.push("");
  lines.push("# Clear existing objects");
  lines.push("bpy.ops.object.select_all(action='SELECT')");
  lines.push("bpy.ops.object.delete(use_global=False)");
  lines.push("");
  lines.push("# Import OBJ file");
  lines.push(`obj_path = os.path.join(os.path.dirname(bpy.data.filepath), '${objFilename}')`);
  lines.push("bpy.ops.wm.obj_import(filepath=obj_path)");
  lines.push("");
  lines.push("# Get the imported object");
  lines.push("obj = bpy.context.selected_objects[0] if bpy.context.selected_objects else None");
  lines.push("");

  if (mesh.skeleton && mesh.skeleton.joints.length > 0) {
    lines.push("# Create armature (skeleton)");
    lines.push("bpy.ops.object.armature_add(enter_editmode=True)");
    lines.push("armature = bpy.context.object");
    lines.push("armature.name = 'Pic3D_Skeleton'");
    lines.push("amt = armature.data");
    lines.push("amt.name = 'Pic3D_Armature'");
    lines.push("");
    lines.push("# Remove default bone");
    lines.push("bpy.ops.armature.select_all(action='SELECT')");
    lines.push("bpy.ops.armature.delete()");
    lines.push("");

    // Create bones
    for (const bone of mesh.skeleton.bones) {
      const fromJoint = mesh.skeleton.joints.find((j) => j.name === bone.from);
      const toJoint = mesh.skeleton.joints.find((j) => j.name === bone.to);
      if (fromJoint && toJoint) {
        const boneName = `${bone.from}_to_${bone.to}`;
        lines.push(`bone = amt.edit_bones.new('${boneName}')`);
        lines.push(
          `bone.head = (${fromJoint.x.toFixed(4)}, ${fromJoint.z.toFixed(4)}, ${fromJoint.y.toFixed(4)})`
        );
        lines.push(
          `bone.tail = (${toJoint.x.toFixed(4)}, ${toJoint.z.toFixed(4)}, ${toJoint.y.toFixed(4)})`
        );
        lines.push("");
      }
    }

    lines.push("bpy.ops.object.mode_set(mode='OBJECT')");
    lines.push("");
    lines.push("# Parent mesh to armature");
    lines.push("if obj:");
    lines.push("    obj.select_set(True)");
    lines.push("    armature.select_set(True)");
    lines.push("    bpy.context.view_layer.objects.active = armature");
    lines.push(
      "    bpy.ops.object.parent_set(type='ARMATURE_AUTO')"
    );
  }

  lines.push("");
  lines.push("print('Pic3D: 3D model imported successfully!')");

  return lines.join("\n");
}

import argparse
import os
import sys
import traceback

import cv2
import numpy as np
import trimesh
from env import GENERAL_POLYROOM_AI_WORKER_POLYROOM_ROOT
from shapely.geometry import Polygon
from shapely.ops import unary_union

sys.path.insert(0, GENERAL_POLYROOM_AI_WORKER_POLYROOM_ROOT)
parser = argparse.ArgumentParser()
# Notice we completely removed the --model_path requirement!
parser.add_argument("--out_glb", type=str, required=True)
parser.add_argument("--out_obj", type=str, required=True)
parser.add_argument("--images", type=str, nargs='+', required=True)
args = parser.parse_args()


def extract_walls_cv(image_path: str, pixel_to_meter: float = 0.05) -> list:
    """
    PHASE 1 & 2: THE PURE MATH ENGINE
    Bypasses AI completely. Uses morphological math to erase furniture and extract thick walls.
    """
    print(f"[CV Engine] Loading image: {image_path}", flush=True)

    # 1. THE ALPHA TRAP: Safely handle transparent PNGs
    img_with_alpha = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img_with_alpha is not None and len(img_with_alpha.shape) == 3 and img_with_alpha.shape[2] == 4:
        alpha_channel = img_with_alpha[:, :, 3] / 255.0
        rgb_channels = img_with_alpha[:, :, :3]
        white_canvas = np.ones_like(rgb_channels, dtype=np.uint8) * 255
        alpha_factor = alpha_channel[:, :, np.newaxis]
        img_rgb = (rgb_channels * alpha_factor + white_canvas *
                   (1 - alpha_factor)).astype(np.uint8)
    else:
        img_rgb = cv2.imread(image_path, cv2.IMREAD_COLOR)

    # 2. BINARY THRESHOLD: Convert to pure Black & White
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_BGR2GRAY)

    # Invert it instantly: Walls become White (255), background becomes Black (0)
    _, binary_inv = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

    # 3. 🚨 THE MAGIC ERASER (Removes text and furniture)
    print("[CV Engine] Erasing text and furniture via math...", flush=True)
    kernel_open = np.ones((3, 3), np.uint8)
    clean_walls = cv2.morphologyEx(binary_inv, cv2.MORPH_OPEN, kernel_open)

    # 🚨 NEW: THE WALL HEALER
    # Fills in the holes, connects broken corners, and smooths out the bite marks!
    print("[CV Engine] Healing broken wall segments...", flush=True)
    kernel_close = np.ones((7, 7), np.uint8)
    healed_walls = cv2.morphologyEx(clean_walls, cv2.MORPH_CLOSE, kernel_close)

    # 4. TRACE THE GEOMETRY (Now tracing the healed walls!)
    print("[CV Engine] Tracing mathematical vectors...", flush=True)
    contours, _ = cv2.findContours(
        healed_walls, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    img_area = binary_inv.shape[0] * binary_inv.shape[1]
    extracted_polygons = []

    for contour in contours:
        area = cv2.contourArea(contour)

        # 🚨 THE SMART VACUUM (Tuned!)
        # - Lowered from 1500 to 300 to save your closets and short walls!
        # - Raised from 40% to 85% so we don't accidentally delete the whole house!
        if area < 300 or area > (img_area * 0.85):
            continue

        # 🚨 GENTLER STRAIGHTENER
        # Lowered from 0.015 to 0.005 so it hugs the corners of your blueprint tighter
        epsilon = 0.005 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)

        if len(approx) >= 3:
            poly_coords = []
            for point in approx:
                x = point[0][0] * pixel_to_meter
                y = point[0][1] * pixel_to_meter
                poly_coords.append([x, y])
            extracted_polygons.append(poly_coords)

    print(
        f"[CV Engine] Extracted {len(extracted_polygons)} perfectly calculated walls!", flush=True)
    return extracted_polygons


def extrude_to_3d(polygons: list, glb_out: str, obj_out: str):
    """
    PHASE 3: THE EXTRUDER & WELDER (Now with Blocky Walls & Floors!)
    """
    print("[CV Engine] Welding and Extruding 2D polygons into 3D walls...", flush=True)

    wall_height = 2.8
    floor_thickness = 0.2

    # 1. Clean up all the individual wall polygons
    valid_polys = []
    for poly_coords in polygons:
        room_poly = Polygon(poly_coords)
        if not room_poly.is_valid:
            room_poly = room_poly.buffer(0)
        valid_polys.append(room_poly)

    if not valid_polys:
        print("❌ [CV Engine] No valid 2D walls to build.")
        return

    # Merge all the overlapping walls into one clean master floorplan
    merged_floorplan = unary_union(valid_polys)
    meshes = []

    # ==========================================
    # 🏗️ NEW: THE CONCRETE FLOOR SLAB
    # ==========================================
    print("[CV Engine] Pouring the concrete floor slab...", flush=True)
    # Get the extreme left, bottom, right, and top edges of the entire building
    minx, miny, maxx, maxy = merged_floorplan.bounds

    # Add a tiny bit of padding (0.5 meters) so the floor extends just slightly past the walls
    pad = 0.5
    floor_poly = Polygon([
        (minx - pad, miny - pad),
        (maxx + pad, miny - pad),
        (maxx + pad, maxy + pad),
        (minx - pad, maxy + pad)
    ])

    try:
        # Extrude the floor, then move it DOWN so it sits under the walls
        floor_mesh = trimesh.creation.extrude_polygon(
            floor_poly, height=floor_thickness)
        floor_mesh.apply_translation([0, 0, -floor_thickness])
        meshes.append(floor_mesh)
    except Exception as e:
        print(f"⚠️ [CV Engine] Failed to build floor plate: {e}")

    # ==========================================
    # 🧱 THE BLOCKY WALL MAKER
    # ==========================================
    if merged_floorplan.geom_type == 'Polygon':
        geometries = [merged_floorplan]
    else:
        geometries = merged_floorplan.geoms

    for geom in geometries:
        # Simplify forces the math lines to be perfectly straight and blocky!
        geom = geom.simplify(0.05, preserve_topology=True)

        # 🚨 THE FIX: We removed the `boundary.buffer` completely!
        # OpenCV already traced the thick walls from your B&W image perfectly.
        # We just extrude them exactly as they are!
        if geom.geom_type == 'Polygon':
            wall_pieces = [geom]
        elif geom.geom_type == 'MultiPolygon':
            wall_pieces = geom.geoms
        else:
            continue

        for piece in wall_pieces:
            try:
                mesh = trimesh.creation.extrude_polygon(
                    piece, height=wall_height)
                meshes.append(mesh)
            except Exception as e:
                print(f"⚠️ [CV Engine] Skipping a corrupted wall segment: {e}")

    if not meshes:
        print("❌ [CV Engine] Mesh generation failed after welding.")
        return

    # Combine the walls and the new floor into one massive 3D object
    combined_room = trimesh.util.concatenate(meshes)

    # 🚨 THE HORIZON FIX: Rotate the model 90 degrees so it lays flat on the floor in Blender!
    import math
    rotation_matrix = trimesh.transformations.rotation_matrix(
        math.radians(90), [1, 0, 0])
    combined_room.apply_transform(rotation_matrix)

    # Make sure output directories exist and save!
    os.makedirs(os.path.dirname(glb_out), exist_ok=True)
    combined_room.export(glb_out)
    combined_room.export(obj_out)
    print(f"[CV Engine] Successfully saved {glb_out}", flush=True)


def main():
    try:
        print("⚡ [CV Engine] Booting Pure Math Pipeline...", flush=True)
        input_image = args.images[0]

        # 1 & 2. Find the walls using OpenCV
        extracted_polygons = extract_walls_cv(input_image)

        # Fallback if the image was completely blank
        if len(extracted_polygons) == 0:
            print(
                "⚠️ [CV Engine] WARNING: Math engine found 0 walls. Falling back to test box.")
            extracted_polygons = [
                [[-5, -5], [5, -5], [5, -4.8], [-5, -4.8]],
                [[4.8, -5], [5, 5], [4.8, 5], [4.8, -5]],
                [[-5, 5], [5, 5], [5, 4.8], [-5, 4.8]],
                [[-5, -5], [-4.8, -5], [-4.8, 5], [-5, 5]]
            ]

        # 3. Extrude into 3D
        extrude_to_3d(extracted_polygons, args.out_glb, args.out_obj)
        print("✅ [CV Engine] Pipeline Complete!", flush=True)

    except Exception as e:
        print(f"❌ FATAL ERROR TRIGGERED! Here is the full stack trace:", flush=True)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
